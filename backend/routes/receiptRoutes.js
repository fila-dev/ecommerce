// Get receipt by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const receipt = await Receipt.findById(id);
    
    if (!receipt) {
      return res.status(404).json({error: 'Receipt not found'});
    }

    // Verify user owns this receipt
    if (receipt.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({error: 'Not authorized to view this receipt'});
    }

    res.status(200).json(receipt);
  } catch (error) {
    res.status(400).json({error: error.message});
  }
});

// Get all receipts for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify requesting user matches userId param
    if (userId !== req.user._id.toString()) {
      return res.status(401).json({error: 'Not authorized to view these receipts'});
    }

    const receipts = await Receipt.find({ userId }).sort({createdAt: -1});
    res.status(200).json(receipts);
  } catch (error) {
    res.status(400).json({error: error.message}); 
  }
});
