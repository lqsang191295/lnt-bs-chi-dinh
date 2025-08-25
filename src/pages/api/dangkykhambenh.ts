import { NextApiRequest, NextApiResponse } from 'next';
import { 
  timKiemBenhNhan, 
  layThongTinTuCCCD, 
  themBenhNhan, 
  dangKyKhamBenh,
  taoMaPhieuTuDong
} from '@/actions/act_dangkykhambenh';
import { IBenhNhan, IDangKyKhamBenh } from '@/model/dangkykhambenh';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { action, data } = req.body;

    switch (action) {
      case 'timKiemBenhNhan':
        const searchResult = await timKiemBenhNhan(data);
        return res.status(200).json({
          status: 'success',
          message: 'Tìm kiếm thành công',
          data: searchResult
        });

      case 'layThongTinTuCCCD':
        const cccdResult = await layThongTinTuCCCD(data.cccd);
        return res.status(200).json({
          status: 'success',
          message: 'Lấy thông tin thành công',
          data: cccdResult
        });

      case 'themBenhNhan':
        const addResult = await themBenhNhan(data as IBenhNhan);
        return res.status(200).json(addResult);

      case 'dangKyKhamBenh':
        const dangKyResult = await dangKyKhamBenh(data as IDangKyKhamBenh);
        return res.status(200).json(dangKyResult);

      case 'taoMaPhieuTuDong':
        const maPhieu = await taoMaPhieuTuDong();
        return res.status(200).json({
          status: 'success',
          message: 'Tạo mã phiếu thành công',
          data: maPhieu
        });

      default:
        return res.status(400).json({
          status: 'error',
          message: 'Action không hợp lệ'
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Lỗi hệ thống',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
