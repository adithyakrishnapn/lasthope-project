import React, { useEffect, useState, useRef } from 'react';
import './banner.css';

function Banner() {
    const imgRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [animationClass, setAnimationClass] = useState('');

    const images = [
        'https://res.cloudinary.com/dwglhhb8s/image/upload/v1738058793/lasthope/wmbaojq35egytqroalxx.png',
        'https://res.cloudinary.com/dwglhhb8s/image/upload/v1738060299/lasthope/d0mgyz0nh53a6cpwxs8c.png',
        'https://res.cloudinary.com/dwglhhb8s/image/upload/v1738061692/lasthope/q81o0mcfhtenud8gsg5q.png',
    ];

    const Slider = () => {
        setAnimationClass(''); // Remove the animation class
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length); // Change image
            setAnimationClass('slide-in'); // Re-add the animation class after changing the image
        }, 100); // Add a slight delay (100ms)
    };

    useEffect(() => {
        const interval = setInterval(Slider, 5000); // Change image every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className='banner'>
            <img
                ref={imgRef}
                src={images[currentIndex]}
                alt="Banner"
                className={animationClass}
            />
        </div>
    );
}

export default Banner;
