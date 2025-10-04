import feedoLogo from "@/assets/feedo-logo.jpg";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} rounded-lg overflow-hidden flex items-center justify-center bg-[#1e3a4c]`}>
        <img src={feedoLogo} alt="Feedo" className="w-full h-full object-cover" />
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold text-foreground`}>
          Feedo
        </span>
      )}
    </div>
  );
};

export default Logo;
