import yfinance as yf

def get_bist_stock_price(ticker: str):
    try:
        stock = yf.Ticker(f"{ticker}.IS")
        todays_data = stock.history(period='1d')
        if not todays_data.empty:
            current_price = todays_data['Close'].iloc[-1]
            return round(current_price, 2)
        return None
    except Exception as e:
        print(f"BIST fiyatı çekilirken hata oluştu: {e}")
        return None