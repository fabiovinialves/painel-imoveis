function LayoutPrincipal({ children, cabecalho, menuLateral }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-10">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(5,10,20,.60), rgba(5,10,20,.60)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80')",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        {cabecalho}

        <div className="grid min-h-[calc(100vh-120px)] grid-cols-1 lg:grid-cols-[260px_1fr]">
          {menuLateral}
          <main className="bg-[#fbfbfc] p-4 sm:p-6 lg:p-7">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default LayoutPrincipal;