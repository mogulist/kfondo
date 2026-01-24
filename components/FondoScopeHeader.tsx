const FondoScopeHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            {/* Logo Icon - Bicycle on Mountain */}
            <div className="relative w-10 h-10">
              {/* Mountain shape */}
              <svg
                viewBox="0 0 40 40"
                className="w-10 h-10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Mountains */}
                <path
                  d="M8 28L15 16L22 28H8Z"
                  fill="#10b981"
                  className="transition-colors group-hover:fill-emerald-600"
                />
                <path
                  d="M18 28L25 16L32 28H18Z"
                  fill="#059669"
                  className="transition-colors group-hover:fill-emerald-700"
                />
                {/* Road/Path */}
                <path
                  d="M2 28C2 28 10 26 20 26C30 26 38 28 38 28"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-colors group-hover:stroke-emerald-600"
                />
                {/* Cyclist silhouette (simplified) */}
                <circle cx="20" cy="18" r="2" fill="#059669" />
                <path
                  d="M20 20L20 24M18 22L22 22"
                  stroke="#059669"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            
            {/* Logo Text */}
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                FondoScope
              </span>
              <span className="text-xs text-muted-foreground -mt-1">
                그란폰도 기록 통계
              </span>
            </div>
          </a>
          
          {/* Future: Navigation menu can go here */}
          <nav className="ml-auto hidden md:flex items-center gap-6">
            {/* Placeholder for future menu items */}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default FondoScopeHeader;
