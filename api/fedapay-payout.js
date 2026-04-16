module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const {
    transactionId,
    paymentGatewayTransactionId,
    amount,
    currency,
    recipientPhone,
    recipientProvider,
    commissionAmount,
    sellerId,
    sellerEmail,
  } = req.body || {};

  const secretKey = process.env.FEDAPAY_SECRET_KEY;
  const commissionReceiver = process.env.COMMISSION_MOBILE_MONEY_NUMBER;

  if (!secretKey) {
    return res.status(500).json({ error: 'Missing FEDAPAY_SECRET_KEY environment variable.' });
  }

  if (!amount || !recipientPhone || !recipientProvider || !transactionId) {
    return res.status(400).json({ error: 'Missing required payout details.' });
  }

  const body = {
    amount,
    currency: currency || 'XOF',
    reference: transactionId,
    description: `Creator payout for transaction ${paymentGatewayTransactionId}`,
    recipient: {
      type: 'mobile_money',
      provider: recipientProvider,
      phone_number: recipientPhone,
    },
    metadata: {
      sellerId,
      sellerEmail,
      commissionAmount,
      paymentGatewayTransactionId,
    },
  };

  const endpoints = [
    'https://api.fedapay.com/v1/transfers',
    'https://api.fedapay.com/v1/transfer',
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secretKey}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        return res.status(200).json({ success: true, data });
      }

      if (response.status === 404) {
        lastError = data;
        continue;
      }

      return res.status(response.status).json({ error: data });
    } catch (error) {
      lastError = error;
    }
  }

  return res.status(502).json({
    error: 'Failed to call FedaPay payout endpoint.',
    details: lastError,
  });
};
