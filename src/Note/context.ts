import { createContext } from 'react';

export interface INoteContextProps {
  wrapContainer: React.RefObject<HTMLDivElement>;
}

export default createContext<INoteContextProps | null>(null);
