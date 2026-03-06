const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /const RecordTab = \(\{ data, onSave, onBack \}\) => \{[\s\S]*?const EventsTab =/m;

const replacement = `const RecordTab = ({ data, onSave, onBack }) => {
            const [isProcessing, setIsProcessing] = useState(false);
            const safeData = data || {};

            const handleChange = (field, value) => {
                onSave({ ...safeData, [field]: value });
            };

            const getNextDate = (dateStr) => {
                if (!dateStr) return null;
                const d = new Date(dateStr);
                d.setFullYear(d.getFullYear() + 1);
                return d.toLocaleDateString();
            };

            const resizeImageHelper = (file) => {
                return new Promise((resolve) => {
                    const MAX_WIDTH = 1000;
                    const MAX_HEIGHT = 1000;
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = (event) => {
                        const img = new Image();
                        img.src = event.target.result;
                        img.onload = () => {
                            let width = img.width; let height = img.height;
                            if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
                            else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
                            const canvas = document.createElement('canvas');
                            canvas.width = width; canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            // Compress to JPEG 0.8
                            resolve(canvas.toDataURL('image/jpeg', 0.8));
                        };
                    };
                });
            };

            const handleImageUpload = async (e, field) => {
                const file = e.target.files[0];
                if (file) {
                    setIsProcessing(true);
                    try {
                        const resizedDataUrl = await resizeImageHelper(file);
                        handleChange(field, resizedDataUrl);
                    } catch (error) {
                        console.error("Image resize error:", error);
                        alert("画像の処理に失敗しました");
                    } finally {
                        setIsProcessing(false);
                    }
                }
            };

            const nextMixed = getNextDate(safeData.mixedDate);
            const nextRabies = getNextDate(safeData.rabiesDate);

            return (
                <div className="pt-4 pb-20">
                    <div className="relative mb-6 px-2">
                        <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-sm text-theme-text">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                        </button>
                        <div className="text-center">
                            <h2 className="text-xl font-serif text-theme-text">ワクチン管理</h2>
                            <p className="text-[10px] text-theme-text mt-1">大切な記録をクラウドに保存</p>
                        </div>
                    </div>

                    {isProcessing && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                            <div className="bg-white p-6 rounded-2xl flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full border-4 border-theme-primary border-t-transparent animate-spin mb-4"></div>
                                <p className="text-sm font-bold text-theme-text">画像処理中...</p>
                            </div>
                        </div>
                    )}

                    {/* Mixed Vaccine */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-theme-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 rounded-full bg-theme-primary/20 text-theme-primary flex items-center justify-center">
                                <IconHealth />
                            </span>
                            <h3 className="font-serif text-theme-text font-bold">混合ワクチン</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-theme-text mb-2">接種日</label>
                                <input type="date" value={safeData.mixedDate || ''} onChange={(e) => handleChange('mixedDate', e.target.value)} className="w-full bg-theme-base p-3 rounded-xl text-base text-theme-text outline-none focus:ring-theme-primary/20" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-theme-text mb-2">種類</label>
                                <select value={safeData.mixedType || '5種'} onChange={(e) => handleChange('mixedType', e.target.value)} className="w-full bg-theme-base p-3 rounded-xl text-base text-theme-text outline-none focus:ring-theme-primary/20">
                                    <option>5種</option><option>6種</option><option>7種</option><option>8種</option><option>10種</option>
                                </select>
                            </div>
                        </div>
                        {nextMixed && (
                            <div className="text-center bg-theme-primary/5 rounded-xl p-3 mt-2 mb-4">
                                <p className="text-xs text-theme-primary mb-1 font-bold">有効期限</p>
                                <p className="font-serif text-xl text-theme-primary font-bold">{nextMixed}</p>
                            </div>
                        )}
                        <div className="mt-4 border-t border-theme-muted/30 pt-4">
                            <label className="block text-xs font-bold text-theme-text mb-2">証明書の写真</label>
                            {safeData.mixedImage ? (
                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
                                    <img src={safeData.mixedImage} className="w-full h-full object-cover" />
                                    <button onClick={() => handleChange('mixedImage', null)} className="absolute top-2 right-2 p-2 bg-theme-primary text-white rounded-full shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-24 bg-theme-base rounded-xl border border-dashed border-theme-muted cursor-pointer hover:bg-theme-muted/10 transition-colors">
                                    <span className="text-xs text-theme-text font-bold text-theme-primary">+ 写真をアップロード</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'mixedImage')} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Rabies Vaccine */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-theme-secondary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 rounded-full bg-theme-secondary/20 text-theme-secondary flex items-center justify-center">
                                <IconPaw />
                            </span>
                            <h3 className="font-serif text-theme-text font-bold">狂犬病ワクチン</h3>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-theme-text mb-2">接種日</label>
                            <input type="date" value={safeData.rabiesDate || ''} onChange={(e) => handleChange('rabiesDate', e.target.value)} className="w-full bg-theme-base p-3 rounded-xl text-base text-theme-text outline-none focus:ring-theme-secondary/20" />
                        </div>
                        {nextRabies && (
                            <div className="text-center bg-theme-secondary/5 rounded-xl p-3 mt-2 mb-4">
                                <p className="text-xs text-theme-secondary mb-1 font-bold">有効期限</p>
                                <p className="font-serif text-xl text-theme-secondary font-bold">{nextRabies}</p>
                            </div>
                        )}
                        <div className="mt-4 border-t border-theme-muted/30 pt-4">
                            <label className="block text-xs font-bold text-theme-text mb-2">証明書の写真</label>
                            {safeData.rabiesImage ? (
                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
                                    <img src={safeData.rabiesImage} className="w-full h-full object-cover" />
                                    <button onClick={() => handleChange('rabiesImage', null)} className="absolute top-2 right-2 p-2 bg-theme-secondary text-white rounded-full shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-24 bg-theme-base rounded-xl border border-dashed border-theme-muted cursor-pointer hover:bg-theme-muted/10 transition-colors">
                                    <span className="text-xs text-theme-text font-bold text-theme-secondary">+ 写真をアップロード</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'rabiesImage')} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Hospital Memo */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-theme-muted">
                        <label className="block text-xs font-bold text-theme-text mb-2">かかりつけ病院メモ</label>
                        <textarea
                            value={safeData.hospitalMemo || ''}
                            onChange={(e) => handleChange('hospitalMemo', e.target.value)}
                            placeholder="病院名や住所、診察券番号など..."
                            className="w-full h-24 bg-theme-base p-3 rounded-xl text-sm text-theme-text resize-none outline-none focus:ring-theme-muted/50"
                        ></textarea>
                    </div>
                </div>
            );
        };

        const EventsTab =`;

code = code.replace(regex, replacement);
fs.writeFileSync('index.html', code);
console.log('Update Complete.');
