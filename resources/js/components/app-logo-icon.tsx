import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ alt = 'YASKI logo', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return <img src="/yaski-company-icon.png" alt={alt} {...props} />;
}
