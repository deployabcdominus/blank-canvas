import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, Lock } from "lucide-react";
import { useCatalog, CatalogType } from "@/hooks/useCatalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CatalogManagerProps {
  type: CatalogType;
  title: string;
  description: string;
  hasColor?: boolean;
}

export function CatalogManager({ type, title, description, hasColor = false }: CatalogManagerProps) {
  const { items, isLoading, add, update, remove } = useCatalog(type);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#6B7699");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    try {
      await add.mutateAsync({ label: newLabel.trim(), color: hasColor ? newColor : undefined });
      toast.success(`"${newLabel}" agregado a ${title}`);
      setNewLabel("");
    } catch {
      toast.error("Error al agregar");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await update.mutateAsync({ id, label: editLabel });
      setEditingId(null);
      toast.success("Actualizado correctamente");
    } catch {
      toast.error("Error al actualizar");
    }
  };

  const handleRemove = async (id: string, label: string, isDefault: boolean) => {
    if (isDefault) {
      toast.error("Los valores predeterminados no se pueden eliminar");
      return;
    }
    try {
      await remove.mutateAsync(id);
      toast.success(`"${label}" eliminado`);
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>

      <div className="space-y-1.5 mb-4 max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No hay items. Agrega el primero abajo.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors group"
            >
              <GripVertical size={14} className="text-muted-foreground/40 flex-shrink-0" />

              {hasColor && (
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 border border-border"
                  style={{ background: item.color ?? "#6B7699" }}
                />
              )}

              {editingId === item.id ? (
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate(item.id)}
                  className="h-7 text-sm flex-1"
                  autoFocus
                />
              ) : (
                <span className="text-sm text-foreground flex-1">{item.label}</span>
              )}

              {item.is_default && (
              <span title="Valor predeterminado">
                <Lock size={11} className="text-muted-foreground/50 flex-shrink-0" />
              </span>
              )}

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingId === item.id ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleUpdate(item.id)}
                    >
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditLabel(item.label);
                      }}
                    >
                      <Pencil size={11} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 hover:text-destructive"
                      onClick={() => handleRemove(item.id, item.label, item.is_default)}
                      disabled={item.is_default}
                    >
                      <Trash2 size={11} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        {hasColor && (
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="h-9 w-9 rounded-lg border border-border cursor-pointer flex-shrink-0"
          />
        )}
        <Input
          placeholder={`Agregar nuevo ${title.toLowerCase()}...`}
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 h-9 text-sm"
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!newLabel.trim() || add.isPending}
          className="h-9 px-3"
        >
          <Plus size={14} className="mr-1" />
          Agregar
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">
        Presiona Enter o el botón para agregar. Los valores con 🔒 son predeterminados y no se pueden eliminar.
      </p>
    </div>
  );
}
