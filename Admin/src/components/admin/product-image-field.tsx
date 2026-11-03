import { ImageOff } from "lucide-react";
import { useState } from "react";

import { FormField } from "@/components/admin/form-field";
import { Input } from "@/components/ui/input";
import { describedBy } from "@/lib/described-by";

const HINT = "Por enquanto, cole o link de uma foto. Em breve dá para enviar direto do celular.";

/**
 * Photo of the product. Today it takes a URL; once the Cloudflare R2 upload
 * (POST /uploads/product-image, see api.requestProductImageUpload) is
 * implemented, this is the only component that changes — the form keeps
 * submitting `imageUrl`.
 */
export function ProductImageField({ defaultValue, error }: { defaultValue?: string; error?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [failedUrl, setFailedUrl] = useState<string>();
  const showPreview = url.startsWith("https://") && failedUrl !== url;

  return (
    <div className="flex flex-col gap-3">
      <div className="mx-auto flex aspect-4/3 w-full max-w-xs items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted">
        {showPreview ? (
          <img src={url} alt="Prévia da foto" className="size-full object-cover" onError={() => setFailedUrl(url)} />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
            <ImageOff className="size-6" />
            {failedUrl === url && url ? "Não conseguimos abrir essa foto. Confira o link." : "A prévia da foto aparece aqui."}
          </div>
        )}
      </div>
      <FormField id="imageUrl" label="Link da foto" hint={HINT} error={error}>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          inputMode="url"
          placeholder="https://..."
          value={url}
          onChange={(event) => setUrl(event.target.value.trim())}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy("imageUrl", error, HINT)}
          className="h-11"
        />
      </FormField>
    </div>
  );
}
