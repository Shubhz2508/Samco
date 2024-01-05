export interface accessResponse {
    serverTime: string;
    msgId: string;
    status: string;
    statusMessage: string;
    sessionToken: string;
    accountID: string;
    accountName: string;
    exchangeList: string;
    orderTypeList: string;
    productList: string;
}

export interface cancelOrderResponse {
    serverTime: string;
    msgId: string;
    status: string;
    orderNumber: string;
    statusMessage: string;
  }

export interface profileResponse {
    serverTime: string;
    msgId: string;
    status: string;
    statusMessage: string;
    equityLimit: MarginDetails;
    commodityLimit: MarginDetails;
  }
  
export interface MarginDetails {
    grossAvailableMargin: string;
    payInToday: string;
    notionalCash: string;
    collateralMarginAgainstShares: string;
    marginUsed: string;
    netAvailableMargin: string;
}

export interface OrderResponse {
    serverTime: string;
    msgId: string;
    orderNumber: string;
    status: string;
    statusMessage: string;
    exchangeOrderStatus: string;
    rejectionReason: string | null;
    orderDetails: {
      pendingQuantity: string;
      avgExecutionPrice: string;
      orderPlacedBy: string;
      tradingSymbol: string;
      triggerPrice: string;
      exchange: string;
      totalQuantity: string;
      expiry: string;
      transactionType: string;
      productType: string;
      orderType: string;
      quantity: string;
      filledQuantity: string;
      orderPrice: string;
      filledPrice: string;
      exchangeOrderNo: string;
      orderValidity: string;
      orderTime: string;
    };
  }

export interface OrderDetailsResponse {
    serverTime: string;
    msgId: string;
    orderNumber: string;
    status: string;
    statusMessage: string;
    exchangeOrderStatus: string;
    rejectionReason: string | null;
    orderDetails: {
      pendingQuantity: string;
      avgExecutionPrice: string;
      orderPlacedBy: string;
      tradingSymbol: string;
      triggerPrice: string;
      exchange: string;
      totalQuantity: string;
      expiry: string;
      transactionType: string;
      productType: string;
      orderType: string;
      quantity: string;
      filledQuantity: string;
      orderPrice: string;
      filledPrice: string;
      exchangeOrderNo: string;
      orderValidity: string;
      orderTime: string;
    };
  }

export interface OrderBookDetailsResponse {
    serverTime: string;
    msgId: string;
    status: string;
    statusMessage: string;
    orderBookDetails: OrderDetails[];
  }
  
export interface OrderDetails {
    orderNumber: string;
    exchange: string;
    tradingSymbol: string;
    symbolDescription: string;
    transactionType: string;
    productCode: string;
    orderType: string;
    orderPrice: string;
    quantity: string;
    disclosedQuantity: string;
    triggerPrice: string;
    marketProtection: string;
    orderValidity: string;
    orderStatus: string;
    orderValue: string;
    instrumentName: string;
    orderTime: string;
    userId: string;
    filledQuantity: string;
    fillPrice: string;
    averagePrice: string;
    unfilledQuantity: string;
    exchangeOrderId: string;
    rejectionReason: string;
    exchangeConfirmationTime: string;
    cancelledQuantity: string;
    referenceLimitPrice: string;
    coverOrderPercentage: string;
    orderRemarks: string;
    exchangeOrderNumber: string;
    symbol: string;
    displayStrikePrice: string;
    displayNetQuantity: string;
    status: string;
    exchangeStatus: string;
    expiry: string;
    pendingQuantity: string;
    instrument: string;
    scripName: string;
    totalQuantity: string;
    optionType: string;
    orderPlaceBy: string;
    lotQuantity: string;
    parentOrderId: string | null;
  }

export  interface PositionSummaryResponse {
    serverTime: string;
    msgId: string;
    status: string;
    statusMessage: string;
    positionSummary: {
      gainingTodayCount: string;
      losingTodayCount: string;
      totalGainAndLossAmount: string;
      dayGainAndLossAmount: string;
    };
    positionDetails: PositionDetails[];
  }
  
export  interface PositionDetails {
    averagePrice: string;
    exchange: string;
    markToMarketPrice: string;
    lastTradedPrice: string;
    previousClose: string;
    productCode: string;
    symbolDescription: string;
    tradingSymbol: string;
    calculatedNetQuantity: string;
    averageBuyPrice: string;
    averageSellPrice: string;
    boardLotQuantity: string;
    boughtPrice: string;
    buyQuantity: string;
    carryForwardQuantity: string;
    carryForwardValue: string;
    multiplier: string;
    netPositionValue: string;
    netQuantity: string;
    netValue: string;
    positionType: string;
    positionConversions: string[];
    soldValue: string;
    transactionType: string;
    realizedGainAndLoss: string;
    unrealizedGainAndLoss: string;
    companyName: string;
    expiryDate: string;
    optionType: string;
  }
  
export interface OrderDetailsResponse {
    serverTime: string;
    msgId: string;
    orderNumber: string;
    orderStatus: string;
    statusMessage: string;
    orderDetails: {
      pendingQuantity: string;
      avgExecutionPrice: string;
      orderPlacedBy: string;
      tradingSymbol: string;
      triggerPrice: string;
      exchange: string;
      totalQuantity: string;
      expiry: string;
      transactionType: string;
      productType: string;
      orderType: string;
      quantity: string;
      filledQuantity: string;
      orderPrice: string;
      filledPrice: string;
      exchangeOrderNo: string;
      orderValidity: string;
      orderTime: string;
    };
  }

export  interface HoldingSummaryResponse {
    serverTime: string;
    msgId: string;
    status: string;
    statusMessage: string;
    holdingSummary: {
      gainingTodayCount: string;
      losingTodayCount: string;
      totalGainAndLossAmount: string;
      dayGainAndLossAmount: string;
      portfolioValue: string;
    };
    holdingDetails: HoldingDetails[];
  }
  
export  interface HoldingDetails {
    averagePrice: string;
    exchange: string;
    markToMarketPrice: string;
    lastTradedPrice: string;
    previousClose: string;
    productCode: string;
    symbolDescription: string;
    tradingSymbol: string;
    totalGainAndLoss: string;
    calculatedNetQuantity: string;
    holdingsQuantity: string;
    collateralQuantity: string;
    holdingsValue: string;
    isin: string;
    sellableQuantity: string;
    totalMarketToMarketPrice: string;
  }

export interface VerifyAccessTokenResponse {
  serverTime: string;
  msgId: string;
  status: string; // Login Success or Failure
  statusMessage: string;
  sessionToken: string;
  accountID: string;
  accountName: string;
  exchangeList: string[];
  orderTypeList: string[];
  productList: string[];


}