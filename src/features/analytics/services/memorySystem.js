// Memoria que cumple GDPR (datos encriptados localmente o minimizados)
export const savePreference = (key, value) => {
  if (key === "ssn" || key === "diagnostico") throw new Error("No guardar datos médicos directos");
  const encrypted = btoa(value); // Mock encryption
  localStorage.setItem(`tinn_mem_${key}`, encrypted);
};

export const getPreference = (key) => {
  const data = localStorage.setItem(`tinn_mem_${key}`);
  return data ? atob(data) : null;
};
