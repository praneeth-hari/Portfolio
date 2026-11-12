// Framer Motion's animation, hover, tap, focus and in-view features, loaded as their own chunk
// (see <LazyMotion> in main.jsx). The site never uses drag or layout animations, so the heavier
// `domMax` set is not needed.
import { domAnimation } from 'framer-motion';

export default domAnimation;
