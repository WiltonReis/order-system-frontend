import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} OMS — Order Management System.{" "}
          Projeto de portfólio. MIT License.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a
            href="https://github.com/WiltonReis/order-system-backend"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            Backend
          </a>
          <a
            href="https://github.com/WiltonReis/order-system-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            Frontend
          </a>
        </div>
      </div>
    </footer>
  );
}
