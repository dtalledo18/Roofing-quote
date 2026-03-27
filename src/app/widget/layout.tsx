// ✅ Después — sin estilos inline, usa className
export default function WidgetLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="m-0 bg-white">
        {children}
        </body>
        </html>
    );
}