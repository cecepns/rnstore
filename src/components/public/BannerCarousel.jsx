import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { BASE_URL } from '../../utils/api';

const BannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleNavigate = useCallback((url) => {
    navigate(url);
  },[navigate])

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/banners`);
        if (response.ok) {
          const data = await response.json();
          setBanners(data);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: true,
    fade: true,
    cssEase: 'linear',
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          dots: true,
        }
      }
    ]
  };

  if (loading) {
    return (
      <div className="relative h-96 md:h-screen flex items-center justify-center bg-gray-200">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative h-96 md:h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No Banners Available</h2>
          <p className="text-gray-500">Please add banners from admin panel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id} className="relative">
            {/* Desktop Image */}
            <div 
              className="hidden md:block relative h-screen bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${BASE_URL}${banner.image_desktop})`
              }}
              onClick={() => handleNavigate(banner.link_url)}
            >
              {/* <div className="absolute inset-0 bg-black bg-opacity-30"></div> */}
              {/* <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-4xl px-4" data-aos="fade-up">
                  <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    {banner.title}
                  </h1>
                  {banner.subtitle && (
                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.link_url && (
                    <Link
                      to={banner.link_url}
                      className="btn-primary inline-block text-lg px-8 py-3"
                    >
                      Lihat Produk
                    </Link>
                  )}
                </div>
              </div> */}
            </div>

            {/* Mobile Image */}
            <div 
              className="md:hidden relative h-96 bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${BASE_URL}${banner.image_mobile || banner.image_desktop})`
              }}
              onClick={() => handleNavigate(banner.link_url)}
            >
              {/* <div className="absolute inset-0 bg-black bg-opacity-40"></div> */}
              {/* <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-sm px-4" data-aos="fade-up">
                  <h1 className="text-2xl font-bold mb-4">
                    {banner.title}
                  </h1>
                  {banner.subtitle && (
                    <p className="text-sm mb-6 opacity-90">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.link_url && (
                    <Link
                      to={banner.link_url}
                      className="btn-primary inline-block text-sm px-6 py-2"
                    >
                      Lihat Produk
                    </Link>
                  )}
                </div>
              </div> */}
            </div>
          </div>
        ))}
      </Slider>

      {/* Custom Arrow Styles */}
      <style>{`
        .slick-prev,
        .slick-next {
          z-index: 10;
          width: 50px;
          height: 50px;
        }
        
        .slick-prev {
          left: 25px;
        }
        
        .slick-next {
          right: 25px;
        }
        
        .slick-prev:before,
        .slick-next:before {
          font-size: 30px;
          color: white;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .slick-dots {
          bottom: 30px;
        }
        
        .slick-dots li button:before {
          font-size: 15px;
          color: white;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .slick-dots li.slick-active button:before {
          color: #3b82f6;
        }
        
        @media (max-width: 768px) {
          .slick-prev,
          .slick-next {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BannerCarousel;
