import api from './axios.ts';



export const AuthAPI = {
  // -------- LOGIN --------
  login: async (email: string, mot_de_passe: string) => {
    const res = await api.post('/auth/login', {
      email,
      mot_de_passe,
    });
    return res.data;
  },

  // -------- CLIENT SIGNUP -------
  signupClient: (data: {
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe: string;
  }) => {
    return api.post('/auth/signup/client', data);
  },

  // -------- ADMIN CREATION (protected) --------
  createAdmin: (data: {
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe: string;
  }) => {
    return api.post('/auth/create/admin', data);
  },

  // -------- EMPLOYEE CREATION (protected) --------
  createEmployee: (data: {
    user: {
      nom: string;
      prenom: string;
      email: string;
      mot_de_passe: string;
    };
    employee: {
      poste: string;
      salaire: number;
      date_embauche: string;
    };
  }) => {
    return api.post('/auth/create/employee', data);
  },
};
