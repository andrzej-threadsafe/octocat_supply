Feature: Cart quantity management
  As a customer
  I want to adjust product quantities and add items to cart
  So that I can prepare my purchase with the correct quantity

  Background:
    Given I am viewing the product catalog
    And the catalog includes "SmartFeeder One"

  Scenario: Increase quantity and add product to cart
    When I increase quantity for "SmartFeeder One" to 2
    And I add "SmartFeeder One" to cart
    Then I should see a confirmation that 2 items were added
    And the quantity for "SmartFeeder One" should reset to 0

  Scenario: Quantity cannot go below zero
    Given the quantity for "SmartFeeder One" is 0
    When I decrease quantity for "SmartFeeder One"
    Then the quantity for "SmartFeeder One" should remain 0
    And the add to cart button for "SmartFeeder One" should be disabled

  Scenario: Add to cart button enables only when quantity is greater than zero
    Given the quantity for "SmartFeeder One" is 0
    When I increase quantity for "SmartFeeder One" to 1
    Then the add to cart button for "SmartFeeder One" should be enabled

  Scenario: Keyboard-only add to cart interaction
    Given the quantity for "SmartFeeder One" is 0
    When I use keyboard controls to increase quantity for "SmartFeeder One" to 1
    And I use keyboard controls to add "SmartFeeder One" to cart
    Then I should see a confirmation that 1 item was added
    And the quantity for "SmartFeeder One" should reset to 0
