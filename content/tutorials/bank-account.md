---
title: 2. A bank account
description: Model accounts with classes, share behaviour with modules and enforce rules with exceptions.
order: 2
---

You'll build a small banking model: accounts that take deposits and
withdrawals, refuse overdrafts, and keep a transaction history.

## Step 1: a class with state

An `Account` holds an owner name and a balance in cents. Integers are exact,
so storing money as cents avoids floating-point rounding. `initialize`
runs when you call `Account.new`.

```fola
class Account
  attr_reader :owner, :balance

  def initialize(owner)
    @owner = owner
    @balance = 0
  end

  def deposit(cents)
    @balance += cents
  end
end

acct = Account.new("Ada")
acct.deposit(2500)
acct.deposit(1000)
p acct.balance
```

## Step 2: enforce the rules

A withdrawal must not exceed the balance, and amounts must be positive.
Each rule raises its own exception class, so callers can tell them apart.

```fola
class InsufficientFunds < StandardError
end

class InvalidAmount < StandardError
end

class Account
  attr_reader :owner, :balance

  def initialize(owner)
    @owner = owner
    @balance = 0
  end

  def deposit(cents)
    check_amount(cents)
    @balance += cents
  end

  def withdraw(cents)
    check_amount(cents)
    if cents > @balance
      raise InsufficientFunds, "balance is " + @balance.to_s + ", tried to take " + cents.to_s
    end
    @balance -= cents
  end

  def check_amount(cents)
    raise InvalidAmount, "amount must be positive" unless cents > 0
  end
end

acct = Account.new("Ada")
acct.deposit(5000)
acct.withdraw(1200)
p acct.balance

begin
  acct.withdraw(10_000)
rescue InsufficientFunds => e
  puts "refused: " + e.message
end

begin
  acct.deposit(-5)
rescue InvalidAmount => e
  puts "refused: " + e.message
end
```

## Step 3: share formatting with a module

Several classes will need to display cents as dollars. A module is the
place for that kind of shared behaviour. Mix it in with `include`.

```fola
module Money
  def dollars(cents)
    sign = cents < 0 ? "-" : ""
    cents = cents.abs
    sign + "$" + (cents / 100).to_s + "." + format("%02d", cents % 100)
  end
end

class Receipt
  include Money

  def initialize(cents)
    @cents = cents
  end

  def to_s
    "Total: " + dollars(@cents)
  end
end

puts Receipt.new(123456).to_s
puts Receipt.new(5).to_s
```

## Step 4: keep a history

Each operation records a Hash in an array, and `statement` prints them all.
`inject` sums the deposits.

```fola
module Money
  def dollars(cents)
    "$" + (cents / 100).to_s + "." + format("%02d", cents % 100)
  end
end

class InsufficientFunds < StandardError
end

class Account
  include Money
  attr_reader :owner, :balance, :history

  def initialize(owner)
    @owner = owner
    @balance = 0
    @history = []
  end

  def deposit(cents)
    @balance += cents
    record(:deposit, cents)
  end

  def withdraw(cents)
    raise InsufficientFunds, "not enough money" if cents > @balance
    @balance -= cents
    record(:withdraw, cents)
  end

  def total_deposited
    deposits = @history.select { |t| t[:type] == :deposit }
    deposits.inject(0) { |sum, t| sum + t[:cents] }
  end

  def statement
    puts "Statement for " + owner
    @history.each do |t|
      puts "  " + format("%-9s", t[:type].to_s) + dollars(t[:cents]) +
           "  (balance " + dollars(t[:balance]) + ")"
    end
    puts "  deposited in total: " + dollars(total_deposited)
  end

  def record(type, cents)
    @history.push({ type: type, cents: cents, balance: @balance })
    @balance
  end
end

acct = Account.new("Ada")
acct.deposit(10_000)
acct.withdraw(2_550)
acct.deposit(1_999)
acct.statement
```

## Step 5: transfers between accounts

A transfer is a withdrawal from one account and a deposit into another. If
the withdrawal fails, nothing moves, because the exception propagates before
`deposit` runs.

```fola
class InsufficientFunds < StandardError
end

class Account
  attr_reader :owner, :balance

  def initialize(owner, balance)
    @owner = owner
    @balance = balance
  end

  def deposit(cents)
    @balance += cents
  end

  def withdraw(cents)
    raise InsufficientFunds, owner + " can't cover " + cents.to_s if cents > @balance
    @balance -= cents
  end
end

module Bank
  def self.transfer(from, to, cents)
    from.withdraw(cents)
    to.deposit(cents)
    puts "moved " + cents.to_s + " from " + from.owner + " to " + to.owner
  rescue InsufficientFunds => e
    puts "transfer failed: " + e.message
  end
end

ada = Account.new("Ada", 5_000)
lin = Account.new("Lin", 100)

Bank.transfer(ada, lin, 2_000)
Bank.transfer(lin, ada, 9_999)
p ada.balance, lin.balance
```

## Try next

- Add a `SavingsAccount < Account` whose `withdraw` allows only three
  withdrawals per month. Call `super` to reuse the balance check.
- Make `statement` return a String instead of printing, so it can be
  tested. Build it from an array of lines and `join("\n")`.

Next: [3. A to-do list CLI](/tutorials/todo-cli/).
