// --- 1. DOM要素の取得 ---
const cartContainer = document.getElementById('cart-container');
const summaryValue = document.getElementById('summary-value');
const receiveValue = document.getElementById('receive-value');
const resultSummary = document.getElementById('result-summary');
const paymentButton = document.getElementById('payment-button');
const paymentOverlay = document.getElementById('payment-overlay');
const detailValue = document.getElementById('detail-value');

// --- 2. 商品データ定義 ---
const items = [
    { id: "postcard", name: "ポストカード_1", price: 150 },
    { id: "postcard_2", name: "ポストカード_2", price: 150 },
    { id: "illustbook", name: "画集", price: 2000 },
    { id: "acrylkeyholder", name: "アクキー", price: 300 }
];

// --- 3. 状態管理変数 ---
let summary = 0;          // 合計金額
let receiveSummary = 0;   // お預かり金額
let calculationTimer = null;
let overlayTimer = null;
let resetTimer = null;

// --- 4. 関数定義 ---

// 合計金額とお釣りの表示更新
function updateSummary() {
    // 合計表示の更新
    if (summaryValue) {
        summaryValue.textContent = `¥${summary.toLocaleString()}`;
    }

    // お釣り計算と表示更新
    if (resultSummary) {
        const change = receiveSummary - summary;
        resultSummary.textContent = `¥${change.toLocaleString()}`;

        // 合計1円以上 かつ お預かり不足がない場合に決済ボタンを有効化
        if (summary >= 1 && change >= 0) {
            paymentButton.classList.add('enable');
        } else {
            paymentButton.classList.remove('enable');
        }
    }
}

// カートへの商品追加
function addToCart(item) {
    if (!item || !cartContainer) return;

    cartContainer.insertAdjacentHTML('beforeend', `
        <li class="cart-item" data-price="${item.price}">
            <span>${item.name}</span>
            <span>¥${item.price.toLocaleString()}</span>
        </li>
    `);

    summary += item.price;
    updateSummary();
}

// --- 5. イベントリスナーの設定 ---

// ① 商品ボタンのクリックイベント（まとめ登録）
items.forEach(item => {
    const button = document.getElementById(item.id);
    if (button) {
        button.addEventListener('click', () => addToCart(item));
    }
});

// ② カート内の商品削除（クリックされたアイテムを削除）
if (cartContainer) {
    cartContainer.addEventListener('click', (e) => {
        const cartItem = e.target.closest('.cart-item');
        if (cartItem && cartContainer.contains(cartItem)) {
            const price = Number(cartItem.dataset.price);

            if (!isNaN(price)) {
                summary -= price;
            }
            cartItem.remove();
            updateSummary();
        }
    });
}

// ③ テンキー入力（お預かり金額の設定）
document.querySelectorAll('.keypad-btn').forEach(button => {
    button.addEventListener('click', () => {
        const key = button.textContent.trim();

        if (key === 'BS') {
            receiveSummary = Math.floor(receiveSummary / 10);
        } else if (key === '00') {
            receiveSummary *= 100;
        } else {
            receiveSummary = receiveSummary * 10 + Number(key);
        }

        if (receiveValue) {
            receiveValue.textContent = `¥${receiveSummary.toLocaleString()}`;
        }

        // 入力後 0.8秒待ってからお釣りを再計算
        clearTimeout(calculationTimer);
        calculationTimer = setTimeout(updateSummary, 800);
    });
});

// ④ 決済完了モーダルの制御
if (paymentButton) {
    paymentButton.addEventListener('click', () => {
        if (!paymentButton.classList.contains('enable')) return;

        if (detailValue) {
            detailValue.textContent = `¥${summary.toLocaleString()}`;
        }
        if (paymentOverlay) {
            paymentOverlay.classList.add('open');
            if (overlayTimer) {
                clearTimeout(overlayTimer);
                overlayTimer = null;
            }
            if (resetTimer) {
                clearTimeout(resetTimer);
                resetTimer = null;
            }
            resetTimer = setTimeout(() => {
                cartContainer.innerHTML = '';
                summary = 0;
                receiveSummary = 0;
                if (receiveValue) {
                    receiveValue.textContent = '¥0';
                }
                updateSummary();
                clearTimeout(resetTimer);
                resetTimer = null;
            }, 300);
            // 20秒後に自動閉じる
            overlayTimer = setTimeout(() => {
                paymentOverlay.classList.remove('open');
            }, 20000);
        }
    });
}

// ⑤ 感謝カードクリックでモーダルを閉じる
if (paymentOverlay) {
    paymentOverlay.addEventListener('click', () => {
        if (paymentOverlay) {
            paymentOverlay.classList.remove('open');
        }
        if (overlayTimer) {
            clearTimeout(overlayTimer);
            overlayTimer = null;
        }
    });
}

// 初期表示更新
updateSummary();