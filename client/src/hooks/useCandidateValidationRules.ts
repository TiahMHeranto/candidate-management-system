export const useCandidateValidationRules = () => {
  const nameRules = {
    required: 'Le nom est requis',
    minLength: {
      value: 2,
      message: 'Le nom doit contenir au moins 2 caractères',
    },
    maxLength: {
      value: 100,
      message: 'Le nom ne peut pas dépasser 100 caractères',
    },
  };

  const emailRules = {
    required: 'L\'email est requis',
    pattern: {
      value: /^\S+@\S+\.\S+$/,
      message: 'Veuillez fournir un email valide (exemple: nom@domaine.com)',
    },
  };

  const phoneRules = {
    required: 'Le numéro de téléphone est requis',
    pattern: {
      value: /^[0-9+\-\s]{10,}$/,
      message: 'Veuillez fournir un numéro de téléphone valide (chiffres, espaces, tirets, + acceptés)',
    },
  };

  const positionRules = {
    required: 'Le poste est requis',
    minLength: {
      value: 2,
      message: 'Le poste doit contenir au moins 2 caractères',
    },
  };

  const experienceRules = {
    required: 'Les années d\'expérience sont requises',
    min: {
      value: 0,
      message: 'L\'expérience ne peut pas être négative',
    },
    max: {
      value: 50,
      message: 'L\'expérience ne peut pas dépasser 50 ans',
    },
    valueAsNumber: true,
  };

  const skillsRules = {
    required: 'Au moins une compétence est requise',
    validate: (value: string) => {
      const skills = value.split(',').map(s => s.trim()).filter(s => s);
      if (skills.length === 0) {
        return 'Ajoutez au moins une compétence';
      }
      return true;
    },
  };

  return {
    nameRules,
    emailRules,
    phoneRules,
    positionRules,
    experienceRules,
    skillsRules,
  };
};