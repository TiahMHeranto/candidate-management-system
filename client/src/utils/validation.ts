export const validateLoginForm = (email: string, password: string) => {
  const errors = { email: '', password: '' };
  let isValid = true;

  if (!email.trim()) {
    errors.email = "L'email est requis";
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Format d'email invalide";
    isValid = false;
  }

  if (!password) {
    errors.password = "Le mot de passe est requis";
    isValid = false;
  }

  return { isValid, errors };
};