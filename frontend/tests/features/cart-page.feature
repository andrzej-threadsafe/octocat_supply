Feature: Shopping cart
  As a customer
  I want to manage the products in my cart
  So that I can review quantities and the cost before checkout

  Scenario: View an empty cart
    Given my cart is empty
    When I open the cart page
    Then I see the message "Your cart is empty"
    And checkout is unavailable

  Scenario: Add products and open the cart from navigation
    Given I am viewing the product catalog
    When I add 2 "Cat Nap Feeder" products to my cart
    And I add 1 "Feline Fit Mat" product to my cart
    Then the navigation cart count is 3
    When I open the cart from the navigation
    Then I see "Cat Nap Feeder" with quantity 2
    And I see "Feline Fit Mat" with quantity 1

  Scenario: Update quantities and recalculate the order summary
    Given my cart contains 1 "Cat Nap Feeder" priced at $49.99
    When I increase its quantity to 2
    Then its quantity is 2
    And the subtotal is $99.98
    And the shipping fee is $25.00
    And the total is $124.98
    When I decrease its quantity to 1
    Then the subtotal is $49.99
    And the shipping fee is $25.00
    And the total is $74.99

  Scenario Outline: Apply shipping based on the subtotal
    Given my cart subtotal is $<subtotal>
    When I review the order summary
    Then the shipping fee is $<shipping>

    Examples:
      | subtotal | shipping |
      | 49.99    | 25.00    |
      | 100.00   | 25.00    |
      | 100.01   | 0.00     |

  Scenario: Remove cart items and return to the empty state
    Given my cart contains "Cat Nap Feeder" and "Feline Fit Mat"
    When I remove "Cat Nap Feeder"
    Then "Cat Nap Feeder" is no longer in my cart
    And "Feline Fit Mat" remains in my cart
    When I remove "Feline Fit Mat"
    Then I see the message "Your cart is empty"
    And checkout is unavailable

  Scenario: Keep cart contents after reloading the page
    Given my cart contains 2 "Cat Nap Feeder" products
    When I reload the cart page
    Then "Cat Nap Feeder" remains in my cart with quantity 2

  Scenario: Manage quantities with a keyboard
    Given my cart contains 1 "Cat Nap Feeder"
    When I focus the increase quantity control and press Enter
    Then "Cat Nap Feeder" has quantity 2

  Scenario: Review the cart on a mobile-sized screen
    Given I have products in my cart
    When I view the cart on a mobile-sized screen
    Then the cart items and order summary are visible
