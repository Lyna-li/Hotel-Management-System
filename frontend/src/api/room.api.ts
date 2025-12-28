import api from 'axios';

export const RoomsAPI = {
  getAll: async () => {
    const res = await api.get('/rooms');

    // 🔁 map BACKEND → FRONTEND shape
    return res.data.map((r: any) => ({
      id: r.id_room,
      number: r.numero,
      floor: r.etage,
      price: r.prix_par_nuit,
      status: r.statut.toLowerCase(),
      type: r.roomType?.nom_type ?? 'Standard',
      capacity: 2,
      amenities: ['wifi', 'tv', 'ac'],
    }));
  },

  create: async (room: any) => {
    return api.post('/rooms', {
      numero: room.number,
      etage: Number(room.floor),
      prix_par_nuit: Number(room.price),
      statut: room.status.toUpperCase(),
      id_type: 1,
    });
  },

  update: async (id: number, room: any) => {
    return api.put(`/rooms/${id}`, {
      numero: room.number,
      etage: Number(room.floor),
      prix_par_nuit: Number(room.price),
      statut: room.status.toUpperCase(),
    });
  },

  delete: async (id: number) => {
    return api.delete(`/rooms/${id}`);
  },
};
