export const parseSkills = (skillsString: string): string[] => {
  return skillsString
    .split(',')
    .map(skill => skill.trim())
    .filter(skill => skill);
};

export const validateSkills = (skillsString: string): { isValid: boolean; error?: string } => {
  const skills = parseSkills(skillsString);
  
  if (skills.length === 0) {
    return { isValid: false, error: 'Ajoutez au moins une compétence' };
  }
  
  return { isValid: true };
};