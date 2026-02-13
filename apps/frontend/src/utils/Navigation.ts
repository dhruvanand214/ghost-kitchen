let navigateFn: ((path: string) => void) | null = null;

export const setNavigator = (navigate: (path: string) => void) => {
  navigateFn = navigate;
};

export const navigateTo = (path: string) => {
  navigateFn?.(path);
};
