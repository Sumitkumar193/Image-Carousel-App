import { atom } from 'recoil';

export const csrfTokenState = atom({
    key: 'csrfTokenState',
    default: '',
});