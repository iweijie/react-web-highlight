import { createContext } from 'react';
import { INoteTextHighlightInfo } from './type';
export interface INoteContextProps {
  wrapContainer: React.RefObject<HTMLDivElement>;
  selectedValue: React.RefObject<INoteTextHighlightInfo | null>;
  action: React.RefObject<string>;
}

export default createContext<INoteContextProps | null>(null);
