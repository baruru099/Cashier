document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('toggle-scan-btn');
    const interactiveContainer = document.getElementById('interactive');
    let isScanning = false;

    // Quaggaの初期化関数
    function initQuagga() {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: interactiveContainer,
                constraints: {
                    facingMode: "environment",
                    width: 640,     // 厳密な範囲指定をやめて固定値にする
                    height: 480
                }
            },
            locator: { patchSize: "medium", halfSample: true },
            numOfWorkers: navigator.hardwareConcurrency || 4,
            decoder: {
                readers: ["code_128_reader", "ean_reader"]
            },
            locate: true
        }, function (err) {
            if (err) {
                console.error("Quagga初期化失敗:", err);
                return;
            }
            Quagga.start();
            isScanning = true;
            interactiveContainer.classList.add('active'); // カメラ画面を表示
            scanBtn.textContent = 'スキャン停止';
            scanBtn.style.backgroundColor = 'var(--danger-color)';
        });
    }

    // カメラ停止関数
    function stopQuagga() {
        Quagga.stop();
        isScanning = false;
        interactiveContainer.classList.remove('active'); // カメラ画面を隠す
        scanBtn.textContent = 'カメラ起動';
        scanBtn.style.backgroundColor = 'var(--primary-color)';
    }

    // ボタンクリックでの切り替え処理
    if (scanBtn) {
        scanBtn.addEventListener('click', () => {
            if (isScanning) {
                stopQuagga();
            } else {
                initQuagga();
            }
        });
    }
    let cooltime = null;
    // バーコード読み取り時の処理
    Quagga.onDetected((result) => {
        if (cooltime !== null) return;
        cooltime = setTimeout(() => {
            cooltime = null;
        }, 1500);
        const code = result.codeResult.code;
        console.log("★ 読み取ったバーコード:", code);
        const targetItem = items.find(item => item.id === code);
        if (targetItem) {
            addToCart(targetItem);
        }else {
            console.warn("該当する商品が見つかりませんでした");
        }
    });
});