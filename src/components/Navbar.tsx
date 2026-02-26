import { NavLink, Link } from "react-router-dom";
import { motion } from "framer-motion";

const links = [
  { to: "/crash-recovery", label: "Crash Recovery" },
  { to: "/activity-retries", label: "Retries" },
  { to: "/signals", label: "Signals" },
  { to: "/timers", label: "Timers" },
];

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-slide-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 flex items-center h-12 gap-8">
        <Link to="/" className="text-sm font-semibold tracking-tight text-foreground whitespace-nowrap hover:opacity-80 transition-opacity">
          <span className="text-temporal-purple">Temporal</span>{" "}
          <span className="text-muted-foreground font-normal">Workflow Demos</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className="relative"
            >
              {({ isActive }) => (
                <motion.div
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-temporal-purple rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
