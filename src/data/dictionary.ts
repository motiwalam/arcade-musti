import { Lang } from '../types/languages';
import en from './dictionaries/en';
import fr from './dictionaries/francais';

const DICTS: Record<Lang, string[]> = {
    en,
    fr
}

export default DICTS;