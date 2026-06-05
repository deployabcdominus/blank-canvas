
import { useState, useMemo } from 'react';
import { Lead } from '@/types/domain';

export const useLeadFilters = (leads: Lead[], userId: string | undefined) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("todos");

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (ownershipFilter === "mios" && lead.createdByUserId !== userId) return false;
      if (ownershipFilter === "asignados" && lead.assignedToUserId !== userId) return false;
      if (ownershipFilter === "sin_asignar" && lead.assignedToUserId) return false;

      const s = searchTerm.toLowerCase().trim();
      if (!s) return true;
      return (
        lead.name.toLowerCase().includes(s) ||
        lead.company.toLowerCase().includes(s) ||
        lead.service.toLowerCase().includes(s) ||
        lead.status.toLowerCase().includes(s) ||
        lead.contact.phone.toLowerCase().includes(s) ||
        lead.contact.email.toLowerCase().includes(s) ||
        lead.contact.location.toLowerCase().includes(s)
      );
    });
  }, [leads, searchTerm, ownershipFilter, userId]);

  return {
    searchTerm,
    setSearchTerm,
    ownershipFilter,
    setOwnershipFilter,
    filteredLeads
  };
};
