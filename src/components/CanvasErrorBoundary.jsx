import { Component } from 'react';

/**
 * Catches errors thrown by the R3F Canvas (WebGL context loss,
 * GLTF load failures, etc.) so the rest of the page still renders.
 */
export class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('[DroneScene] 3D canvas error caught:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
