import { Button } from "@/components/ui/button";

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-10 flex flex-col items-center gap-3 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button onClick={onRetry}>Tentar novamente</Button>
    </div>
  );
}
