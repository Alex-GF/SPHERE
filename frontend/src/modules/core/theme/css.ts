import { alpha } from "@mui/material";

export function bgGradient(props: { direction?: string; startColor?: string; endColor?: string; imgUrl?: string; color?: string; }) {
    const direction = props?.direction || 'to bottom';
    const startColor = props?.startColor;
    const endColor = props?.endColor;
    const imgUrl = props?.imgUrl;
    const color = props?.color;
  
    if (imgUrl) {
      return {
        background: `linear-gradient(${direction}, ${startColor || color}, ${
          endColor || color
        }), url(${imgUrl})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
      };
    }
  
    return {
      background: `linear-gradient(${direction}, ${startColor}, ${endColor})`,
    };
  }


export function bgBlur(props: { color?: string; blur?: number; opacity?: number; imgUrl?: string; }) {
  const color = props?.color || '#000000';
  const blur = props?.blur || 6;
  const opacity = props?.opacity || 0.8;
  const imgUrl = props?.imgUrl;

  if (imgUrl) {
    return {
      position: 'relative',
      backgroundImage: `url(${imgUrl})`,
      '&:before': {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9,
        content: '""',
        width: '100%',
        height: '100%',
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        backgroundColor: alpha(color, opacity),
      },
    };
  }

  return {
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    backgroundColor: alpha(color, opacity),
  };
}

export function flex(props: { direction?: string; justify?: string; align?: string; }) {
  const direction = props?.direction || 'row';
  const justify = props?.justify || 'center';
  const align = props?.align || 'center';

  return {
    display: 'flex',
    justifyContent: justify,
    alignItems: align,
    flexDirection: direction,
  };
}