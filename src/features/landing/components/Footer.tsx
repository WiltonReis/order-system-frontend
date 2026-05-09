export function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center">
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} OMS — Order Management System.{" "}
        <a
          href="https://github.com/wiltonfilho01/order-system"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline"
        >
          Ver no GitHub
        </a>
      </p>
    </footer>
  );
}
