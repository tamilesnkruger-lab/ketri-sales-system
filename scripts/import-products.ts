import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const PRODUCTS_SOURCE_FILE =
  "D:/Documents/Projeto Codex da Ketri/Pets e tal/KETRI_COMERCIAL_SIMPLES_2026/07_CENTRAL_WEB_COMERCIAL/dados/produtos.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_MAP_FILE = path.join(__dirname, "product-images-map.json");

type RawProduct = {
  codigo?: string;
  nome?: string;
  categoria?: string;
  precoAtual?: string | number | null;
  precoFinal?: string | number | null;
  preco?: string | number | null;
  status?: string;
  imagemPrincipal?: string;
};

type ProductImportRow = {
  sku: string;
  name: string;
  category: string;
  price: number;
  stock_status: "pronto" | "sob encomenda";
  active: boolean;
};

type ProductImageMap = Record<string, string>;

function readOriginalProducts(): RawProduct[] {
  if (!fs.existsSync(PRODUCTS_SOURCE_FILE)) {
    throw new Error(`Base original de produtos nao encontrada: ${PRODUCTS_SOURCE_FILE}`);
  }

  const code = fs.readFileSync(PRODUCTS_SOURCE_FILE, "utf8");
  const context: { window: { produtosKetri?: RawProduct[] }; produtosKetri?: RawProduct[] } = {
    window: {}
  };

  vm.createContext(context);
  vm.runInContext(code, context, { filename: PRODUCTS_SOURCE_FILE });

  const products = context.window.produtosKetri ?? context.produtosKetri;
  if (!Array.isArray(products)) {
    throw new Error("A base original nao exportou window.produtosKetri como lista de produtos.");
  }

  return products;
}

function parsePrice(value: RawProduct["preco"]): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  if (!value) {
    return null;
  }

  const normalized = value
    .replace("R$", "")
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function firstValidPrice(product: RawProduct): number | null {
  return parsePrice(product.precoAtual) ?? parsePrice(product.precoFinal) ?? parsePrice(product.preco);
}

function mapActive(status: string | undefined): boolean {
  return status === "ATIVO";
}

function mapStockStatus(status: string | undefined): ProductImportRow["stock_status"] {
  return status === "ATIVO" ? "pronto" : "sob encomenda";
}

function buildImageMap(products: RawProduct[]): ProductImageMap {
  return products.reduce<ProductImageMap>((map, product) => {
    const sku = product.codigo?.trim();
    const image = product.imagemPrincipal?.trim();

    if (sku && image) {
      map[sku] = image;
    }

    return map;
  }, {});
}

function buildImportRows(products: RawProduct[]): ProductImportRow[] {
  return products.flatMap((product) => {
    const sku = product.codigo?.trim();
    const name = product.nome?.trim();
    const category = product.categoria?.trim();
    const price = firstValidPrice(product);

    if (!sku || !name || !category || price === null) {
      return [];
    }

    return [
      {
        sku,
        name,
        category,
        price,
        stock_status: mapStockStatus(product.status),
        active: mapActive(product.status)
      }
    ];
  });
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente local antes de importar."
    );
  }

  const rawProducts = readOriginalProducts();
  const imageMap = buildImageMap(rawProducts);
  const rows = buildImportRows(rawProducts);
  const skippedCount = rawProducts.length - rows.length;

  fs.writeFileSync(IMAGES_MAP_FILE, `${JSON.stringify(imageMap, null, 2)}\n`, "utf8");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const { error } = await supabase.from("products").upsert(rows, { onConflict: "sku" });

  if (error) {
    throw error;
  }

  console.log(`Produtos lidos da base original: ${rawProducts.length}`);
  console.log(`Produtos importados/atualizados: ${rows.length}`);
  console.log(`Produtos ignorados por falta de SKU, nome, categoria ou preco valido: ${skippedCount}`);
  console.log(`Mapa de imagens atualizado: ${IMAGES_MAP_FILE}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
