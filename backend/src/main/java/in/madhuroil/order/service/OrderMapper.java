package in.madhuroil.order.service;

import in.madhuroil.order.domain.*;
import in.madhuroil.order.dto.OrderDtos.*;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public OrderItemDto toDto(OrderItem i) {
        return new OrderItemDto(i.getVariantId(), i.getSku(), i.getProductName(), i.getPackagingName(),
                i.getUnitPrice(), i.getQuantity(), i.getLineTotal());
    }

    public OrderDto toDto(Order o, RazorpayCheckoutDto razorpay) {
        return toDto(o, razorpay, null);
    }

    public OrderDto toDto(Order o, RazorpayCheckoutDto razorpay, RefundInfoDto refund) {
        return new OrderDto(o.getId(), o.getOrderNumber(), o.getStatus().name(),
                o.getContactName(), o.getContactPhone(), o.getContactEmail(),
                o.getShipLine1(), o.getShipLine2(), o.getShipCity(), o.getShipState(), o.getShipPincode(),
                o.getDeliveryMethod().name(), o.getPaymentMethod().name(),
                o.getSubtotal(), o.getShippingFee(), o.getDiscountAmount(), o.getTotal(),
                o.getItems().stream().map(this::toDto).toList(), o.getPlacedAt(),
                razorpay, refund);
    }
}
