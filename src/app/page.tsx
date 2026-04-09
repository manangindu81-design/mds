"use client";
import { useState, useEffect } from "react";

const services = [
  {
    icon: "💰",
    title: "Simpanan",
    description: "Simpanan pokok, sukarela, dan harian dengan bunga kompetitif hingga 6% per tahun.",
  },
  {
    icon: "🏦",
    title: "Pinjaman",
    description: "Pinjaman cepat dengan bunga rendah mulai 0,8% per bulan. Tanpa jaminan.",
  },
  {
    icon: "📈",
    title: "Investasi",
    description: "Program investasi menguntungkan dengan risiko terkontrol untuk masa depan.",
  },
  {
    icon: "📱",
    title: "Layanan Digital",
    description: "Akses mudah melalui mobile banking dan ATM untuk transaksi kapan saja.",
  },
];

const products = [
  {
    title: "Simpanan Pokok",
    description: "Setoran awal wajib menjadi anggota dengan minimal Rp 250.000",
    color: "#1B4D3E",
  },
  {
    title: "Simpanan Sukarela",
    description: "Menabung dengan fleksibilitas tinggi dan bunga 5-6% per tahun",
    color: "#2D7A5F",
  },
  {
    title: "Simpanan Berjangka",
    description: "Deposito dengan bunga lebih tinggi mulai 7% per tahun",
    color: "#D4AF37",
  },
  {
    title: "Pinjaman Umum",
    description: "Dana kebutuhan pribadi dengan proses cepat dan bunga rendah",
    color: "#1B4D3E",
  },
  {
    title: "Pinjaman Bisnis",
    description: "Modal kerja untuk mengembangkan usaha dengan bunga kompetitif",
    color: "#2D7A5F",
  },
  {
    title: "Pinjaman Produktif",
    description: "Dana investasi untuk meningkatkan produktivitas anggota",
    color: "#D4AF37",
  },
];

const testimonials = [
  {
    name: "Budi Santoso",
    role: "Anggota sejak 2019",
    quote: "KSP Mulia Dana Sejahtera sangat membantu modal usaha saya. Proses cepat dan bunga terjangkau.",
    image: "👨",
  },
  {
    name: "Siti Rahayu",
    role: "Anggota sejak 2020",
    quote: "Layanan digitalnya sangat memudahkan. Tabungan dan pinjaman bisa dilakukan dari rumah.",
    image: "👩",
  },
  {
    name: "Ahmad Wijaya",
    role: "Anggota sejak 2018",
    quote: "Sekarang usaha saya berkembang pesat berkat dukungan KSP Mulia Dana Sejahtera.",
    image: "👨",
  },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Nama wajib diisi";
    if (!formData.email.trim()) errors.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Email tidak valid";
    if (!formData.phone.trim()) errors.phone = "Telepon wajib diisi";
    if (!formData.message.trim()) errors.message = "Pesan wajib diisi";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      alert("Terima kasih! Pesan Anda telah terkirim. Tim kami akan menghubungi Anda segera.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    }
  };

  return (
    <main>
      {/* Header */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, background: "var(--color-surface)", zIndex: 1000, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 80 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 32 }}>🏛️</span>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, color: "var(--color-primary)" }}>KSP Mulia Dana Sejahtera</div>
              <div style={{ fontSize: 11, color: "var(--color-secondary)", letterSpacing: 1 }}>TERDAFTAR & TERAWASI</div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav style={{ display: "flex", gap: 32 }} className="desktop-nav">
            {["Beranda", "Layanan", "Tentang", "Produk", "Kontak"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  textDecoration: "none",
                  color: "var(--color-text-primary)",
                  fontWeight: 500,
                  fontSize: 15,
                  transition: "color 0.3s",
                }}
                onMouseOver={(e) => e.currentTarget.style.color = "var(--color-primary)"}
                onMouseOut={(e) => e.currentTarget.style.color = "var(--color-text-primary)"}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: "none", background: "none", border: "none", fontSize: 24, cursor: "pointer" }}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu" style={{ padding: "24px", background: "var(--color-surface)", borderTop: "1px solid #eee" }}>
            {["Beranda", "Layanan", "Tentang", "Produk", "Kontak"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: "block", padding: "12px 0", textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, borderBottom: "1px solid #f0f0f0" }}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="beranda" style={{ minHeight: "100vh", display: "flex", alignItems: "center", background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)", paddingTop: 80 }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div style={{ color: "var(--color-text-light)" }}>
            <div style={{ 
              display: "inline-block", 
              background: "rgba(212, 175, 55, 0.2)", 
              color: "var(--color-secondary)", 
              padding: "8px 16px", 
              borderRadius: 24, 
              fontSize: 14, 
              fontWeight: 600,
              marginBottom: 24,
              border: "1px solid var(--color-secondary)"
            }}>
              ✨ Telah Terbentuk Seit 2012
            </div>
            <h1 style={{ 
              fontSize: 56, 
              lineHeight: 1.1, 
              marginBottom: 24,
              fontFamily: "var(--font-heading)"
            }}>
              Mulia Dana Sejahtera
            </h1>
            <p style={{ fontSize: 22, opacity: 0.9, marginBottom: 40, maxWidth: 500 }}>
              Membangun Negeri, Membahagiakan Anggota
            </p>
            <p style={{ fontSize: 16, opacity: 0.8, marginBottom: 40, maxWidth: 480, lineHeight: 1.8 }}>
              Bergabunglah dengan ribuan anggota yang telah merasakan manfaat 
              layanan keuangan terpercaya. Dana Anda aman, bunga menguntungkan.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <a href="#kontak" className="btn btn-secondary" style={{ fontSize: 16 }}>
                Bergabung Sekarang
              </a>
              <a href="#tentang" style={{ 
                display: "inline-block", 
                padding: "16px 32px", 
                background: "transparent", 
                border: "2px solid rgba(255,255,255,0.3)", 
                borderRadius: 8, 
                color: "var(--color-text-light)",
                textDecoration: "none",
                fontWeight: 600,
                transition: "all 0.3s"
              }}>
                Pelajari Lebih Lanjut
              </a>
            </div>
          </div>
          
          <div style={{ 
            background: "rgba(255,255,255,0.1)", 
            borderRadius: 24, 
            padding: 48,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ textAlign: "center", color: "var(--color-text-light)" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🏛️</div>
              <div style={{ fontSize: 48, fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--color-secondary)" }}>
                15+ Tahun
              </div>
              <div style={{ fontSize: 18, opacity: 0.9 }}>Melayani Anggota</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 40 }}>
                <div style={{ background: "rgba(255,255,255,0.1)", padding: 24, borderRadius: 16 }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "var(--color-secondary)" }}>5.000+</div>
                  <div style={{ fontSize: 14, opacity: 0.8 }}>Anggota Aktif</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.1)", padding: 24, borderRadius: 16 }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "var(--color-secondary)" }}>50M+</div>
                  <div style={{ fontSize: 14, opacity: 0.8 }}>Aset (Rp)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="layanan" className="section" style={{ background: "var(--color-background)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ 
              display: "inline-block", 
              color: "var(--color-primary)", 
              fontSize: 14, 
              fontWeight: 600, 
              letterSpacing: 2,
              marginBottom: 16
            }}>
              LAYANAN KAMI
            </div>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              Solusi Keuangan Terpercaya
            </h2>
            <p className="section-subtitle" style={{ margin: "0 auto", textAlign: "center" }}>
              Kami menyediakan berbagai layanan keuangan yang dirancang untuk memenuhi kebutuhan anggota dengan aman, mudah, dan menguntungkan.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {services.map((service, index) => (
              <div key={index} className="card" style={{ textAlign: "center" }}>
                <div style={{ 
                  fontSize: 48, 
                  marginBottom: 20,
                  width: 80,
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)",
                  borderRadius: 16,
                  margin: "0 auto 20px"
                }}>
                  {service.icon}
                </div>
                <h3 style={{ fontSize: 20, marginBottom: 12, color: "var(--color-text-primary)" }}>
                  {service.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="tentang" className="section" style={{ background: "var(--color-surface)" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div style={{ 
            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)", 
            borderRadius: 24, 
            padding: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 500
          }}>
            <div style={{ textAlign: "center", color: "var(--color-text-light)" }}>
              <div style={{ fontSize: 80, marginBottom: 24 }}>🏛️</div>
              <div style={{ fontSize: 24, fontFamily: "var(--font-heading)", marginBottom: 16 }}>
                KSP Mulia Dana Sejahtera
              </div>
              <div style={{ fontSize: 16, opacity: 0.8, maxWidth: 300 }}>
                Berdiri sejak 2012, melayani anggota dengan prinsip transparan, akuntabel, dan profesional.
              </div>
            </div>
          </div>
          
          <div>
            <div style={{ 
              color: "var(--color-primary)", 
              fontSize: 14, 
              fontWeight: 600, 
              letterSpacing: 2,
              marginBottom: 16
            }}>
              TENTANG KAMI
            </div>
            <h2 className="section-title">
              Membangun Kepercayaan, Menciptakan Kemakmuran
            </h2>
            <p style={{ fontSize: 16, color: "var(--color-text-secondary)", marginBottom: 32, lineHeight: 1.8 }}>
              KSP Mulia Dana Sejahtera adalah lembaga keuangan mikro yang dikelola secara profesional 
              dengan prinsip kehati-hatian. Kami berkomitmen untuk membantu masyarakat mengakses layanan keuangan 
              yang mudah, aman, dan terjangkau.
            </p>
            
            <div style={{ display: "grid", gap: 24, marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: "50%", 
                  background: "var(--color-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-accent)",
                  fontWeight: 700,
                  fontSize: 20
                }}>
                  ✓
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Terdaftar & Terawasi</div>
                  <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Legalitas lengkap sesuai regulasi</div>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: "50%", 
                  background: "var(--color-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-accent)",
                  fontWeight: 700,
                  fontSize: 20
                }}>
                  ✓
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Bunga Kompetitif</div>
                  <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Bunga tabungan hingga 6% per tahun</div>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: "50%", 
                  background: "var(--color-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-accent)",
                  fontWeight: 700,
                  fontSize: 20
                }}>
                  ✓
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Proses Cepat & Mudah</div>
                  <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Pinjam dana dalam hitungan hari</div>
                </div>
              </div>
            </div>
            
            <a href="#produk" className="btn btn-primary">
              Lihat Produk Lainnya
            </a>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="produk" className="section" style={{ background: "var(--color-background)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ 
              display: "inline-block", 
              color: "var(--color-primary)", 
              fontSize: 14, 
              fontWeight: 600, 
              letterSpacing: 2,
              marginBottom: 16
            }}>
              PRODUK KAMI
            </div>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              Pilihan Investasi & Pembiayaan
            </h2>
            <p className="section-subtitle" style={{ margin: "0 auto", textAlign: "center" }}>
              various financial products suit your needs, from savings to loans with competitive rates.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {products.map((product, index) => (
              <div 
                key={index} 
                className="card" 
                style={{ 
                  borderTop: `4px solid ${product.color}`,
                  padding: "28px"
                }}
              >
                <h3 style={{ fontSize: 18, marginBottom: 12, color: "var(--color-text-primary)" }}>
                  {product.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                  {product.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ background: "var(--color-primary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ 
              display: "inline-block", 
              color: "var(--color-secondary)", 
              fontSize: 14, 
              fontWeight: 600, 
              letterSpacing: 2,
              marginBottom: 16
            }}>
              TESTIMONI ANGGOTA
            </div>
            <h2 className="section-title" style={{ textAlign: "center", color: "var(--color-text-light)" }}>
              Apa Kata Anggota Kami
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                style={{ 
                  background: "rgba(255,255,255,0.1)", 
                  borderRadius: 16, 
                  padding: 32,
                  backdropFilter: "blur(10px)"
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>&ldquo;</div>
                <p style={{ fontSize: 16, color: "var(--color-text-light)", fontStyle: "italic", marginBottom: 24, lineHeight: 1.7 }}>
                  {testimonial.quote}
                </p>
                <div style={{ fontWeight: 600, color: "var(--color-text-light)" }}>
                  {testimonial.name}
                </div>
                <div style={{ fontSize: 14, color: "var(--color-secondary)" }}>
                  {testimonial.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontak" className="section" style={{ background: "var(--color-surface)" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>
          <div>
            <div style={{ 
              color: "var(--color-primary)", 
              fontSize: 14, 
              fontWeight: 600, 
              letterSpacing: 2,
              marginBottom: 16
            }}>
              HUBUNGI KAMI
            </div>
            <h2 className="section-title">
              Mari Berdiskusi
            </h2>
            <p style={{ fontSize: 16, color: "var(--color-text-secondary)", marginBottom: 32, lineHeight: 1.8 }}>
              Punya pertanyaan atau ingin bergabung? Silakan hubungi kami melalui formulir di samping 
              atau kontak langsung. Tim kami siap membantu Anda.
            </p>
            
            <div style={{ display: "grid", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 12, 
                  background: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24
                }}>
                  📍
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Alamat</div>
                  <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
                    Jl. Utama No. 123, Kota Sejahtera, Indonesia
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 12, 
                  background: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24
                }}>
                  📞
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Telepon</div>
                  <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
                    (021) 1234-5678
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 12, 
                  background: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24
                }}>
                  ✉️
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Email</div>
                  <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
                    info@kspmuliadanasejahtera.co.id
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: 40 }}>
            <h3 style={{ fontSize: 24, marginBottom: 32 }}>Kirim Pesan</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ 
                    width: "100%", 
                    padding: "14px 16px", 
                    borderRadius: 8, 
                    border: formErrors.name ? "2px solid #e74c3c" : "2px solid #eee",
                    fontSize: 16,
                    outline: "none",
                    transition: "border-color 0.3s"
                  }}
                  placeholder="Masukkan nama Anda"
                />
                {formErrors.name && (
                  <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.name}</div>
                )}
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ 
                    width: "100%", 
                    padding: "14px 16px", 
                    borderRadius: 8, 
                    border: formErrors.email ? "2px solid #e74c3c" : "2px solid #eee",
                    fontSize: 16,
                    outline: "none",
                    transition: "border-color 0.3s"
                  }}
                  placeholder="email@contoh.com"
                />
                {formErrors.email && (
                  <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.email}</div>
                )}
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Nomor Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ 
                    width: "100%", 
                    padding: "14px 16px", 
                    borderRadius: 8, 
                    border: formErrors.phone ? "2px solid #e74c3c" : "2px solid #eee",
                    fontSize: 16,
                    outline: "none",
                    transition: "border-color 0.3s"
                  }}
                  placeholder="0812 3456 7890"
                />
                {formErrors.phone && (
                  <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.phone}</div>
                )}
              </div>
              
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Pesan</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  style={{ 
                    width: "100%", 
                    padding: "14px 16px", 
                    borderRadius: 8, 
                    border: formErrors.message ? "2px solid #e74c3c" : "2px solid #eee",
                    fontSize: 16,
                    outline: "none",
                    resize: "vertical",
                    transition: "border-color 0.3s",
                    fontFamily: "inherit"
                  }}
                  placeholder="Tulis pesan Anda di sini..."
                />
                {formErrors.message && (
                  <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.message}</div>
                )}
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "var(--color-accent)", color: "var(--color-text-light)", padding: "64px 0 32px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 32 }}>🏛️</span>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600 }}>
                  KSP Mulia Dana Sejahtera
                </div>
              </div>
              <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.8, marginBottom: 24 }}>
                Koperasi Simpan Pinjam yang terpercaya, profesional, dan berkelanjutan. 
                Membangun kesejahteraan anggota sejak 2012.
              </p>
              <div style={{ display: "flex", gap: 16 }}>
                {["📘", "📸", "🐦"].map((icon, i) => (
                  <a
                    key={i}
                    href="#"
                    style={{
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 18,
                      textDecoration: "none",
                      transition: "background 0.3s"
                    }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: 16, marginBottom: 20 }}>Menu</h4>
              <nav style={{ display: "grid", gap: 12 }}>
                {["Beranda", "Layanan", "Tentang", "Produk", "Kontak"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    style={{ fontSize: 14, opacity: 0.8, textDecoration: "none", transition: "opacity 0.3s" }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
                    onMouseOut={(e) => e.currentTarget.style.opacity = "0.8"}
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>
            
            <div>
              <h4 style={{ fontSize: 16, marginBottom: 20 }}>Layanan</h4>
              <nav style={{ display: "grid", gap: 12 }}>
                {["Simpanan", "Pinjaman", "Investasi", "Layanan Digital"].map((item) => (
                  <a key={item} href="#layanan" style={{ fontSize: 14, opacity: 0.8, textDecoration: "none" }}>
                    {item}
                  </a>
                ))}
              </nav>
            </div>
            
            <div>
              <h4 style={{ fontSize: 16, marginBottom: 20 }}>Jam Operasional</h4>
              <div style={{ fontSize: 14, opacity: 0.8, lineHeight: 2 }}>
                <div>Senin - Jumat: 08:00 - 16:00</div>
                <div>Sabtu: 08:00 - 14:00</div>
                <div>Minggu: Tutup</div>
              </div>
            </div>
          </div>
          
          <div style={{ 
            borderTop: "1px solid rgba(255,255,255,0.1)", 
            paddingTop: 24, 
            display: "flex", 
            justifyContent: "space-between",
            fontSize: 14,
            opacity: 0.7
          }}>
            <div>© 2024 KSP Mulia Dana Sejahtera. All rights reserved.</div>
            <div style={{ display: "flex", gap: 24 }}>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Kebijakan Privasi</a>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (max-width: 768px) {
          .section { padding: 64px 0; }
          .section-title { font-size: 32px !important; line-height: 40px !important; }
          #beranda .container { grid-template-columns: 1fr !important; text-align: center; }
          #beranda h1 { font-size: 40px !important; }
          #beranda p { font-size: 18px !important; }
          #beranda > div > div:last-child { margin-top: 40px; }
          #tentang .container { grid-template-columns: 1fr !important; }
          #tentang > div > div:last-child { order: -1; }
          #kontak .container { grid-template-columns: 1fr !important; }
          footer > div > div { grid-template-columns: 1fr !important; gap: 32px !important; text-align: center; }
          footer > div > div > div:first-child { display: flex; flex-direction: column; align-items: center; }
          footer > div > div > div > div { justify-content: center; }
        }
      `}</style>
    </main>
  );
}