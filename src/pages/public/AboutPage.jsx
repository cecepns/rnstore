
const AboutPage = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tentang Kami
          </h1>
          <p className="text-xl text-gray-600">
            Toko iPhone terpercaya sejak 2020
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div data-aos="fade-right">
            <img
              src="https://images.pexels.com/photos/1174775/pexels-photo-1174775.jpeg"
              alt="About Us"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          
          <div data-aos="fade-left">
            {/* <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Mengapa Memilih Kami?
            </h2> */}
            <div className="space-y-4 text-gray-600">
              <p>
                RN STORE telah menjadi pilihan utama para pecinta Apple di Indonesia. 
                Kami berkomitmen menyediakan produk Apple original dengan harga terbaik.
              </p>
              <p>
                Dengan pengalaman lebih dari 5 tahun, kami telah melayani ribuan pelanggan 
                dengan kepuasan yang tinggi. Semua produk kami dilengkapi dengan garansi resmi.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Produk 100% Original</li>
                <li>Garansi Resmi Apple</li>
                <li>Harga Kompetitif</li>
                <li>Layanan After Sales Terbaik</li>
                <li>Pengiriman Cepat dan Aman</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;