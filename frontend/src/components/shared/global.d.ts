export {};

declare global {
  interface Window {
    html2pdf?: () => {
      from: (el: HTMLElement) => any;
      set: (opts: any) => any;
      save: () => void;
    };
  }
}
