import {
  MDBCol,
  MDBContainer,
  MDBFooter,
  MDBIcon,
  MDBRow,
} from 'mdb-react-ui-kit';
import React from 'react';

export default function App() {
  return (
    <MDBFooter className="bg-dark text-white text-center text-lg-start">
      <MDBContainer className="p-4">
        <MDBRow>
          {/* Cột Logo và giới thiệu */}
          <MDBCol lg="4" md="6" className="mb-4 mb-md-0">
            <h5 className="text-uppercase">
              <MDBIcon fas icon="rocket" className="me-2" />
              HTCD 
            </h5>
            <p>
             Chúng tôi tự hào mang đến cho bạn những thiết kế thời trang độc đáo, chất lượng hàng đầu và trải nghiệm mua sắm đẳng cấp.
            </p>
            <div>
            <div>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                  <MDBIcon fab icon="facebook" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                  <MDBIcon fab icon="twitter" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                  <MDBIcon fab icon="instagram" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white">
                  <MDBIcon fab icon="linkedin" />
                </a>
              </div>
            </div>
          </MDBCol>

          {/* Cột Hỗ trợ khách hàng */}
          <MDBCol lg="4" md="6" className="mb-4 mb-md-0">
            <h5 className="text-uppercase">Hỗ trợ khách hàng</h5>
            <ul className="list-unstyled">
              <li>
                <a href="#!" className="text-white">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="#!" className="text-white">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#!" className="text-white">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#!" className="text-white">
                  Liên hệ hỗ trợ
                </a>
              </li>
            </ul>
          </MDBCol>

          {/* Cột Thông tin liên hệ */}
          <MDBCol lg="4" md="6" className="mb-4 mb-md-0">
            <h5 className="text-uppercase">Thông tin liên hệ</h5>
            <ul className="list-unstyled">
              <li>
                <MDBIcon fas icon="map-marker-alt" className="me-2" />
                123 Đường ABC, Phường XYZ, Thành phố Đà Nẵng
              </li>
              <li>
                <MDBIcon fas icon="phone" className="me-2" />
                (+84) 123 456 789
              </li>
              <li>
                <MDBIcon fas icon="envelope" className="me-2" />
                info@mywebsite.com
              </li>
              <li>
                <MDBIcon fas icon="clock" className="me-2" />
                Thứ 2 - Thứ 7: 8:00 - 18:00
              </li>
            </ul>
          </MDBCol>
        </MDBRow>
      </MDBContainer>

      <div className="text-center p-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        © {new Date().getFullYear()} Bản quyền thuộc về: 
        <a className="text-white ms-1" href="https://hethongcode.com/">
          HTCD
        </a>
      </div>
    </MDBFooter>
  );
}
