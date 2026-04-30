export const onboardingService = {
  getStep: (id) => localStorage.getItem("step-" + id),
  saveStep: (id, val) => localStorage.setItem("step-" + id, val)
};
