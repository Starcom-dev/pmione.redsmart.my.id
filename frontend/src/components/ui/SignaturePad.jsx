import { useRef, useState, useEffect, useCallback } from 'react';

export default function SignaturePad({ value, onChange, width = 400, height = 160 }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const ctxRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = value;
    }
  }, [value, width, height]);

  const getPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(pos.x, pos.y);
  }, [getPos]);

  const draw = useCallback((e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    ctxRef.current.lineTo(pos.x, pos.y);
    ctxRef.current.stroke();
    setHasSignature(true);
  }, [isDrawing, getPos]);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    if (hasSignature && onChange) {
      onChange(canvasRef.current.toDataURL('image/png'));
    }
  }, [hasSignature, onChange]);

  const clear = () => {
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, width, height);
    setHasSignature(false);
    if (onChange) onChange('');
  };

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          className="cursor-crosshair touch-none"
        />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={clear}
          className="text-xs text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors">
          Hapus
        </button>
        {hasSignature && <span className="text-xs text-green-600 flex items-center">   '               "            ...    Tersimpan</span>}
      </div>
    </div>
  );
}
