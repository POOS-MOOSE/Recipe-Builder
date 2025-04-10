import { Router, Request, Response } from 'express';
import { fetchBlueCartData } from '../utils/bluecart';

const router = Router();

router.post('/produce-prices', async (req: Request, res: Response): Promise<void> => {
    const { produceList } = req.body;
    if (!Array.isArray(produceList) || produceList.length === 0) {
      res.status(400).json({ error: 'produceList must be a non-empty array' });
      return;
    }
    
    try {
      const results = await Promise.all(
        produceList.map(async (produce: string) => {
          try {
            const data = await fetchBlueCartData(produce);
            const price =
              data.search_results &&
              data.search_results.length > 0 &&
              data.search_results[0].offers &&
              data.search_results[0].offers.primary &&
              typeof data.search_results[0].offers.primary.price !== 'undefined'
                ? data.search_results[0].offers.primary.price
                : null;
            return { produce, price };
          } catch (error) {
            return { produce, error: 'Failed to fetch data' };
          }
        })
      );

      res.json({ results });
    } catch (error) {
      console.error("Error processing produce list:", error);
      res.status(500).json({ error: 'Failed to retrieve produce prices from BlueCart.' });
    }
  }
);

export default router;
