
import React from "react";

interface XLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

/**
 * X Logo (formerly Twitter) SVG icon, black by default, inherits color.
 * @see https://about.x.com/brand/toolkit
 */
const XLogo: React.FC<XLogoProps> = ({ size = 20, className = "", ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 1200 1200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="X (formerly Twitter)"
    {...rest}
  >
    <title>X (formerly Twitter)</title>
    <rect width="1200" height="1200" fill="white" fillOpacity="0"/>
    <path
      fill="currentColor"
      d="M353.996 300h164.165l181.384 246.421L898.065 300h63.782L683.79 566.167 976 900h-166.53L616.231 668.545 393.206 900H329.424l246.493-276.388L224 300h129.996Zm233.802 318.528 37.515 50.856L858.867 852.444h-90.577L545.838 668.827l-37.384-50.577L340.919 347.556H431.496l157.031 215.519 31.271 43.399Z"
    />
  </svg>
);

export default XLogo;
