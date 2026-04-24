import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectsService, ProjectInsert, ProjectUpdate } from '@/services/projects.service';
import { toast } from 'sonner';

export const useProjectsQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await ProjectsService.getAll(companyId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });

  const createProjectMutation = useMutation({
    mutationFn: (newProject: ProjectInsert) => ProjectsService.create(newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', companyId] });
      toast.success('Proyecto creado correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al crear el proyecto: ' + error.message);
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProjectUpdate }) => 
      ProjectsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', companyId] });
      toast.success('Proyecto actualizado');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar el proyecto: ' + error.message);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => ProjectsService.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', companyId] });
      toast.success('Proyecto eliminado');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar el proyecto: ' + error.message);
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    projectsQuery,
    createProjectMutation,
    updateProjectMutation,
    deleteProjectMutation,
  };
};
