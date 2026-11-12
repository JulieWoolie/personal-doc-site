---
title: "Tetral Language Specification"
subtitle: "Technical Specification for the Tetral Language"
weight: 40
publish_date: '2026-09-20 15:00:00 +0200 UTC'
author: Julie
toc: true
noindent: true
---

# Status
This document is a work-in-progress and is subject to change and
its current state does not represent a final document.

# Introduction
Tetral, derived the Greek prefix _tetra-_ for *"four,"* is a scripting language 
intended to be executed by an interpreter, or virtual machine, and to provide a 
platform-agnostic execution system. This document will serve as the 
specification for this language and outline key aspects of its grammar, type 
system and code execution.

## Core Principles
Tetral is designed with the following 4 core principles in mind.

Statically Typed
: Types must be specified and known at compile-time to allow for execution
environments to optimize as much as possible and to provide easy readability
for programmers.

Platform-Agnostic
: As long as an interpreter exists, it shouldn't matter how the IR was
compiled, it should be possible to execute it.

Explicit Null Control
: Values should never be allowed to be null, unless explicitly stated to be 
otherwise.

Memory Safety
: Users of the language should not have to worry about freeing or allocating 
memory manually, and should not worry about the objects they're using becoming
de-allocated as they're using them.

# Scope

This document defines the Tetral scripting language (Also referred to as 
_TetralScript_, or _TetralLang_) and the Tetral Bytecode format.

# Terms, Concepts and Definitions

Source File
: A text file containing Tetral source code.

Bytecode / Intermediate Representation (IR)
: The compiled representation of Tetral source code. The terms "bytecode," "IR," 
and "intermediate representation" are used interchangeably throughout this document.

Program
: A valid Tetral source file or Tetral bytecode file that can be executed by 
a Tetral execution environment.

Access
: To read or modify the value of an object.

Bit
: A single binary digit, having a value of either 0 or 1.

Byte
: A sequence of 8 bits. The byte is the smallest addressable unit of memory.

Alignment
: The requirement that a value of a given type be stored at a memory address 
that is a multiple of that type's alignment value.

Padding
: Unused space inserted in memory to ensure that a value is stored at a 
correctly aligned address.

Native
: Describes a feature, function, variable, or library implemented in a 
lower-level language, such as C or C++, rather than in Tetral.

Symbol
: An entity that can be referred to by a name. Symbols include, but are not 
limited to:
  - Functions
  - Structs
  - Enums
  - Classes
  - Local variables
  - Global variables
  - Imported symbols

Namespace
: A named scope that groups related symbols. Namespace names are written as a 
sequence of identifiers delimited by `::`.

Simple Name
: The name of a symbol as written in a source file, without a namespace prefix.

Fully Qualified Name
: The name of a symbol prefixed by its namespace.

Binary Name
: The name of a symbol in compiled Tetral IR.

Module
: A collection of functions, types, and variables declared within a specific 
namespace.

Implicit Import
: A module that is imported without being explicitly imported by the user. 
Implicit imports vary by execution environment.

Code unit
: An encoded unit of data corresponding to a Unicode encoding.

Code point
: A Unicode code point. For more info on codepoints, please see the Unicode 
Standard.

Character
: Unless stated otherwise, this term refers to a _code point_.

# Conformance

Any program able to accept a valid source file or valid bytecode file as input
for execution is considered a conforming Tetral execution environment.

Source code validity is defined in the following language section and bytecode
file validity is defined in the bytecode format section.

Any use of *"shall"*, or *"must"* in this document declares a
constraint that must be followed.

# Environments

The Tetral language may be executed in one or multiple of several contexts, or
*execution environments.*

Depending on the context of the execution/compilation of a Tetral program,
the environments used may differ. For example, an embedded program loading a
Tetral source file may first use the Compilation Environment and then the
Embedded Environment to execute the code, or only the Embedded Environment if
loading a bytecode file.

## Translation Environment

The translation environment provides only basic support for language features
required to evaluate constant expressions and constant functions.

Translation environments only operate on Tetral source files.

## Standalone Environment

A standalone environment is one where a Tetral file is executed as a fully
standalone program with a single defined entry point.

A standalone program's entry point must be defined as a function with the
name *main* and have one of the following signatures:

- `int32 main(string[] args)`
- `void main(string[] args)`
- `int32 main()`
- `void main()`

The standalone environment must also provide full support for the standard
library and the importing of external symbols.

Standalone environments must also implicitly import the `std` and
`std::strings` standard library modules.

## Embedded Environment

An embedded environment is one in which Tetral programs are executed by a
native application which embeds a conforming Tetral execution environment.
This environment has no pre-defined entry point, nor any predefined libraries
that the environment must implement.

Native-level bindings are not pre-defined for embedded environments are
defined by the program embedding the Tetral execution environment.

# Data Types
A data type is a specific unit of memory that holds data in a specific layout
to represent some piece of information.

This section defines the data types implementations must support and the kinds
of data types that can be declared by users of the language. Additional 
terminology and information may be defined for each data type in its 
corresponding section. 

Each section will also define the following properties for its data type: 
- Whether the data type can be _default-initialized_. Default initialization 
  determines whether an object of that data type can be initialized without a 
  value being explicitly declared. 
- The data type's string representation. The string representation of a data 
  type's value is used in string templating and when concatenating a data type's
  value with a string.
- Whether the data type can be compared with other data types and if so, how 
  that comparison is done. If a data type states is can be compared, then it is 
  considered a _comparable type_.
- Which types of values the data type can be equal to and how equality is 
  established.
- If the type is _indexable,_ meaning if a value of the type can be accessed 
  with an index access operator. (`[]`) If a type is indexable, then it will 
  also specify the data type of the values that are returned when indexing into 
  a value of the type along with what type of value is considered a valid 
  _indexer._ An indexer shall be the data type(s) of the values used to index 
  into an indexable type. 

Data types additionally exist in two categories. The first category is *value 
types*. When value types are passed to a callable object or assigned, the value 
is copied to the destination. *Reference types*, on the other hand, only pass a 
reference to the data type's value.

Data types may be referred to more simply as just *types*.

## The Boolean Type
The boolean data type shall be a value data type which represents a false/true 
state.

The boolean data type must be represented by a single byte in memory. If the 
byte's value is 0, then the boolean value is false, otherwise it is true.

Boolean values shall be _default-initialized_. The default boolean value shall 
be _false._

A boolean value's string representation shall be either _"true"_ if the value 
is not false, otherwise it's string representation shall be _"false."_

Boolean values shall be compared only to other boolean values. A boolean value 
shall be considered _"less than"_ another boolean value if it's value is false, 
and the other boolean value is true. A boolean value shall be _equal to_ another 
boolean value if both hold the same true/false state.

## The Void Type
The void data type represents a non-existent value. Used for functions/methods 
which return no value. This data type shall only be used in specifying the 
return type of callable objects. No variables, properties or class fields shall
use the void data type.

The void type's string representation shall be _"void"_. Since the void type 
must not exist as a value, it cannot be compared to another type, nor shall it 
be possible to establish equality with any value of any type.

<h3 id="inttypes">Integral Types</h3>
Integral types shall be value types of varying sizes used to represent whole 
numbers.

Integral types shall be _default-initialized_. Each integral type's default 
value shall be its equivalent of the value 0.

Each integral value's string representation shall be its numerical value 
converted to a base-10 string. If the integral value is signed and is negative,
the string representation shall be prefixed with a _"-"_.

Integral value comparability and equality Semantics are stated in the next 
section.

The following is a table of the integral types which implementations must
support along with the range of values of each integral type.

<table>
  <caption>Tetral Integral Types</caption>
  <thead>
  <tr>
    <th>Type Name</th>
    <th>Size and alignment</th>
    <th>Description</th>
    <th>Minimum value</th>
    <th>Maximum value</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td><code>uint8</code></td>
    <td>1</td>
    <td>Unsigned 8-bit integer</td>
    <td><code>0</code></td>
    <td><code>255</code></td>
  </tr>
  <tr>
    <td><code>int8</code></td>
    <td>1</td>
    <td>Signed 8-bit integer</td>
    <td><code>-128</code></td>
    <td><code>127</code></td>
  </tr>
  <tr>
    <td><code>uint16</code></td>
    <td>2</td>
    <td>Unsigned 16-bit integer</td>
    <td><code>0</code></td>
    <td><code>65535</code></td>
  </tr>
  <tr>
    <td><code>int16</code></td>
    <td>2</td>
    <td>Signed 16-bit integer</td>
    <td><code>-32768</code></td>
    <td><code>32767</code></td>
  </tr>
  <tr>
    <td><code>uint32</code></td>
    <td>4</td>
    <td>Unsigned 32-bit integer</td>
    <td><code>0</code></td>
    <td><code>4294967295</code></td>
  </tr>
  <tr>
    <td><code>int32</code></td>
    <td>4</td>
    <td>Signed 32-bit integer</td>
    <td><code>-2147483648</code></td>
    <td><code>2147483647</code></td>
  </tr>
  <tr>
    <td><code>uint64</code></td>
    <td>8</td>
    <td>Unsigned 64-bit integer</td>
    <td><code>0</code></td>
    <td><code>18446744073709551615</code></td>
  </tr>
  <tr>
    <td><code>int64</code></td>
    <td>8</td>
    <td>Signed 64-bit integer</td>
    <td><code>-9223372036854775808</code></td>
    <td><code>9223372036854775807</code></td>
  </tr>
  </tbody>
</table>

<h3 id="floattypes">Floating Point Types</h3>
The floating-point types shall be value types which hold a numeric value 
according to the corresponding IEEE-745 standard format.

Floating point values shall be _default-initialized_. Each floating point type's 
default value shall be that type's 0 value.

Each floating point type's string representation is it's numerical value 
converted to a base-10 ASCII string.

<table>
  <caption>Tetral Floating Point Types</caption>
  <thead>
  <tr>
    <th>Type Name</th>
    <th>Size and alignment</th>
    <th>Description</th>
    <th>IEEE Format</th>
  </tr>
  </thead>
  <tbody>
  <tr><td><code>float32</code></td><td>4</td><td>32-bit floating point type</td><td>binary32</td></tr>
  <tr><td><code>float64</code></td><td>8</td><td>64-bit floating point type</td><td>binary64</td></tr>
  </tbody>
</table>

All floating point types and integral types are collectively referred to as
*arithmetic types.*

All floating point types, integral types and the boolean type are collectively
referred to as *primitive types.*

Arithmetic values shall only be compared to other arithmetic values. An arithmetic
value shall be considered less than another arithmetic value if and only if the 
numeric value it represents is lesser than the other value's represented numeric 
value.

Arithmetic value equality shall only be established between any two arithmetic 
values. An arithmetic value shall be equal to another if it's represented numeric
value is equal to the other arithmetic value's represented numeric value.

## Array Types

Array types shall be a kind of reference type which hold a sequential list of a 
specific data type.

Each unit of data contained in an array shall be referred to as an *"element,"*
and the amount of items the array holds shall be called its *"length."*

The data type contained by an array type shall be referred to as its
*component type*.

Arrays are an _indexable_ type. Array types shall be accessible with an indexer
value of any signed or unsigned integral type. The indexed type of an array 
shall be its component type.

Arrays shall exist in two separate kinds: mutable and immutable. Elements in an
immutable array cannot be changed, while in a mutable array, they can.

Regardless of an array's mutability kind, an array's length shall be fixed and 
cannot be modified after creation.

Array types shall be _default-initialized_. An array type's default value shall 
be an empty array, an array with length 0.

The string representation of an array value shall be a string prefixed with 
_\"[\"_ followed by the string representation of each of its elements, delimited
by _\", \"_ and then followed with _\"]\"_. The string representation of an 
empty array shall be _"[]"_.

Equality between array values shall only be established between two array 
values of the same component type. If the lengths of two arrays differ, they 
shall not be equal, then if every element of one array is equal to the 
corresponding element in another array, the arrays shall be equal.

Array values shall only be compared if both arrays are of the same, comparable 
type. The first _N_ elements of both arrays are compared, with _N_ being the 
length of the smaller array. The first element that is greater than or less than 
the corresponding element in another array determines how the arrays compare. 
If no element is greater than or less than a corresponding element in another 
array, then the array with the smaller capacity is lesser. If both arrays are of 
the same length, the arrays are equal. 

## The String Type

The String type shall be a reference type which holds a sequential list of UTF-8
code units.

The string type shall be immutable, none of its elements can be changed. 
The amount of UTF-8 code units stored in a string shall be called its 
*"length."*

Array and string types collectively constitute the _"indexable"_ types. This 
means these types can be accessed with the index operator. (`[]`)

Strings are an _indexable_ type. String values shall be accessible with an 
indexer value of any signed or unsigned integral type. The indexed type of a 
string shall be an unsigned 8-bit integral, representing the UTF-8 code unit at
that index inside the string.

The string type shall be _default-initialized_. Its default value shall be an 
empty string, a string with length 0.

The string representation of a string shall be the string itself.

String value equality shall only be established between two string values. 
Likewise, strings shall only be compared with other strings. The Semantics for 
both string equality and comparability is the same as Array equality and 
comparability.

## Struct Types

Struct types shall be a kind of value type, which are made up of 
*"properties,"* each of which shall have a name and a pre-set data type, 
determined by the user.

Structs shall not hold any properties that directly or indirectly reference the
struct itself.

A struct type may be _default-initialized_. If each property's type in a struct
can be _default-initialized_, then so can the struct. Otherwise, if all
properties which cannot _default-initialized_ have a default value specified,
then the struct shall be _default-initialized_. Otherwise, if a struct contains
properties which are not of a _default-initialized_ type and do not have a 
specified default value, the struct shall not be _default-initialized._ 

The string representation of a struct shall be a string prefixed with _"{"_ 
followed by the name and value of each property. The name of a property shall be 
separated from its value with a _" = "_ sequence and each pair of property name 
and value delimited with _", "_. The string shall finally be suffixed with a 
_"}"_ sequence.

Struct equality shall only be established between two struct values of the same 
struct type. If every property's value in a struct is equal to another, then the
struct values shall be equal.

Struct values shall not be comparable.

For example this struct:

<code class="qs">
<keyw>struct</keyw> <id>A</id> {
<br><ident></ident><keyw>uint32</keyw> a = <quoted>0</quoted>
<br><ident></ident><keyw>float64</keyw> b = <quoted>0</quoted>
<br>}
</code>

Defines two properties:
- The first property is named 'a' with a 32-bit unsigned integer as its data type.
- The second property is named 'b' with a 64-bit floating point number as its data type.

Both properties are initialized to a default value of 0.

## Enum Types

Enum types shall be a kind of value type that declare a list of named constant 
integer values. Each constant value will be referred to as an _enum-constant_.

The underlying value of an enum constant shall be referred to as its
*"ordinal"* value.

Enum constants may have a value explicitly declared, but this is not required. 
If an enum constant's value is not declared explicitly, then it's value shall be
the value of the previous enum constant plus 1. Enum constants may declare the 
same value as another enum constant in the same enum type.

The maximum possible ordinal value an enum constant may hold is 2147483647 and 
the smallest possible value is -2147483648.

An enum type may be _default-initialized_, if there exists an enum constant in 
that enum type with the ordinal value 0. Otherwise, it shall not be 
_default-initialized_.

The string representation of an enum constant shall be the string representation
of the ordinal value of the enum constant.

Enum values shall only be compared to other enum values of the same enum type. 
An enum value shall be less than another enum value if it's ordinal value is 
less than another enum's ordinal value.

Enum value equality shall only be established with enum values of the same enum 
type. An enum value shall only be equal to another enum value if it's ordinal 
value is identical to another enum value's ordinal value.

For example the enum declaration:

<code class="qs">
<keyw>enum</keyw> <id>E</id> {
<br><ident></ident>CONST_A = <quoted>1</quoted>,
<br><ident></ident>CONST_B,
<br><ident></ident>CONST_C = <quoted>0</quoted>,
<br><ident></ident>CONST_D,
<br>}
</code>

In this enum declaration:
- The enum constant `CONST_A` has the explicit ordinal value of 1.
- The enum constant `CONST_B` has the implicit ordinal value of 2.
- The enum constant `CONST_C` has the explicit ordinal value of 0.
- The enum constant `CONST_D` has the implicit ordinal value of 1.

## Variant Types

Variant types shall be a kind of value type which define a list of variants the 
variant type itself can take the form of.

Variant types will be referred to as *variant types*, while each
declared variant will be referred to as a *variant of the variant type*,
or more simply as just *variant.*

Each variant of a variant type shall declare 0 or more properties, each of which
must have a name and a pre-set data type.

The index of a variant in a variant type is referred to as its
*"ordinal"* value.

Variant types can hold type parameters.

Variant types shall be _default-initialized_ if the variant with ordinal 0 has 
no properties.

The string representation of a variant shall be a string prefixed with the name 
of the variant type of the value and then followed by a string representation of 
each of its properties in the same manner as the string representation of 
structs.

Variant values shall not be comparable.

Establishing equality of variant type values shall only be possible with variant
type values of the same variant type. Equality shall first depend on the variant
type values having identical ordinal values. If the variant declares any 
properties, all property values must be equal between the variant values. If 
no properties were specified, then the variant type values shall only be equal if 
their ordinal values are identical.

For example the variant declaration:

<code class="qs">
<keyw>variant</keyw> <id>Optional</id>&lt;<id>T</id>&gt; {
<br><ident></ident>Empty(),
<br><ident></ident>Present(<id>T</id> value),
<br>}
</code>

Has two variant types:
- The first is named _Empty_ and has no properties, thus this variant can be _default-initialized_.
- The second is named _Present_ has one property, the type parameter property.

## Interface Types

An interface type shall be a kind of reference type, but not a type which can 
itself be instantiated.

Interfaces shall declare 0 or more methods which must be defined by any class
wishing to implement the interface.

Implementing an interface shall mean declaring a class as being an implementer 
of an interface type and defining a function body for each of the methods the
interface declares.

Interfaces may hold type parameters.

Interface types shall not be _default-initialized_.

Interface equality and comparability Semantics shall be the same as those for 
class types.

## Class Types

Class types shall be a kind of reference type which define class members. Class 
members are either constructors, methods or fields.

Constructors are functions which shall be invoked upon the creation of a class 
type's value. Constructs may, like functions and methods, require certain 
arguments to correctly initialize the class instance.

Methods shall be functions that exist within the namespace of a class. Methods 
shall also be divided into two separate types: static and non-static. Static 
methods belong to the class, while non-static methods belong to a class 
instance. Methods inside classes and interfaces shall have access to the `this` 
keyword that shall refer to the instance of the class the method belongs to. For
static methods, the keyword shall not be available.

Fields shall be the properties that belong either to class instances, or for 
static fields, to the class itself. Non-static Fields shall be subject to the 
same padding and alignment Semantics as struct properties. Non-static fields may
be referred to as _"instance fields"_ and static fields referred to as 
_"class members."_

Classes may extend one other class and can implement as many non-conflicting
interfaces as described in the limits section (See <chapter-ref target="limits"></chapter-ref>.) 
Non-conflicting shall mean that none of the implemented interfaces have 
themselves declared methods, or inherited methods from another extended 
interface, whose function signatures are in conflict. Two function signatures 
are in conflict if their argument types and name are the same, but not their 
return types.

Class extension shall mean the extending class gains access to all its public
and protected members. Classes can also override any non-const methods of its 
extended class.

Unless specified otherwise, the term *extend* will be used for classes
implementing interface as well.

Classes and interfaces will be referred to collectively as
*object types.*

An object type extended by another object type is referred to as
the *parent* of the extending object type. An object type extending another 
object type is referred to as the *child* type of the extended object type.

A type which directly or indirectly extends another type (by way of its parent
extending the type, for example) is referred to as a *derived* object
type of the extended object type. Vice versa, the term *super* will be
used for an object type which is extended indirectly or directly by another
object type.

Class types may hold type parameters.

Functions, and methods on object types are collectively referred to as
*callable objects*, or just *callables.*

Classes may _override_ any non-static methods of their super types that are 
not marked as _const_. Overriding shall mean that all calls to the super type's 
method instead go to the derived object type's method.

Class types shall not be _default-initialized_.

The string representation of a class type value shall be a string prefixed with 
the name of the class type followed by the string representation of each of its 
properties, regardless of access modifier, in the same fashion as the string 
representation of structs.

Class type values shall not be comparable.

Class type value equality shall only be established between class values of 
identical class types or between class types where one is a derived type of the 
other. If two class values are not of the same class type, they shall not be 
equal. Otherwise, the value of each instance field must be equal to the 
corresponding instance field.

### Function Types

A function type shall be a kind of reference type which outlines the argument 
types and returned type of a callable object.

Function types shall not be instantiated nor shall they be 
_default-initialized_.

The string representation of a function type shall be a string prefixed _"("_, 
followed by a _", "_-delimited list of the names of each argument's data type.
The string is then suffixed with _") -> "_ followed by the name of the returned 
type.

Function types shall not be comparable to any value of any type.

Function value equality shall be possible to establish with other function 
values of the same function signature. Function type values shall only be equal
if they refer to the same function.

### Nullables

A nullable type shall be a value type which marks another type as nullable, 
meaning its value may or may not exist.

The value existence state of a nullable value is referred to as it's
*presence state*. And the type a nullable type is being used on shall be 
referred to as the _"nulled type."_

Nullable values shall be _default-initialized_. Nullable values shall be 
initialized to a value with a false presence state by default.

The string representation of a nullable shall be either the string _"null"_ if 
the presence state of the nullable value is false, or the string representation 
of the nulled type's value, if it's value is present.

Nullable values shall not be comparable to any value of any type.

Nullable value equality shall only be established between nullable values of 
the same nulled type, or between a nullable value and a non-nullable value of 
the same nulled type. If both nullable values have a false presence state, they 
shall be equal. Otherwise, the nullable value's nulled type's values must be 
equal in order to establish equality.

### Type Compatibility And Assignability

Type compatibility shall determine if a type can be passed as an argument to a 
callable, set as the value of a variable, a variant/struct property, or a class 
field. The following table only determines semantic compatibility, it does not 
list conversions that may or not need to be performed when assigning a value of
one type to an object of another, compatible, type.

<table>
  <caption>Type Compatibility Table</caption>
  <thead>
  <tr>
    <th>Type</th>
    <th>Can be assigned from</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td>Strings</td>
    <td>Only other Strings.</td>
  </tr>
  <tr>
    <td>Immutable Arrays</td>
    <td>Only arrays of the same component type.</td>
  </tr>
  <tr>
    <td>Mutable Arrays</td>
    <td>Only mutable arrays of the same component type.</td>
  </tr>
  <tr>
    <td>Unsigned Integers</td>
    <td>Any unsigned integer of the same or smaller size.</td>
  </tr>
  <tr>
    <td>Signed Integers</td>
    <td>
      Any signed integer of the same or smaller size, or any unsigned integer
      of a smaller size.
    </td>
  </tr>
  <tr>
    <td>Floating point numbers</td>
    <td>Any floating point value of the same or smaller size, or any integer.</td>
  </tr>
  <tr>
    <td>Structs</td>
    <td>Only other struct values of the same struct type.</td>
  </tr>
  <tr>
    <td>Enums</td>
    <td>Only other values of the same enum type.</td>
  </tr>
  <tr>
    <td>Variant Types</td>
    <td>Only other values of the same variant type.</td>
  </tr>
  <tr>
    <td>Variants</td>
    <td>Only other values of the same variant.</td>
  </tr>
  <tr>
    <td>Interfaces</td>
    <td>
      Any value of the same interface, or any value of a dervied object type
      which extends the interface.
    </td>
  </tr>
  <tr>
    <td>Classes</td>
    <td>Any value of the same class or a derived class.</td>
  </tr>
  <tr>
    <td>Nullables</td>
    <td>
      For non-object types, the nulled type must be identical. For object
      types, the assigned nulled type must be a compatible type with the
      target nullable's type.
    </td>
  </tr>
  </tbody>
</table>

For types with type parameters, all the type parameters must be set to the
same exact type.

<h3 id="type-conversions">Type Conversions</h3>

This section defines the conversion operations that must occur between types.
If there is no conversion listed from one type to another in this section,
then it means that nothing must be done to convert from one type to another,
or that the conversion is not possible. See the previous section for type
compatibility and assignability.

### Implicit Conversions

These conversions must be done implicitly without requiring an explicit cast
operation by a user of the language. When the term *"usual arithmetic
conversions"* is referenced, the following conversions are what they
reference.

<table>
  <caption>Implicit conversion operations</caption>
  <thead>
  <tr>
    <th>Source Type</th>
    <th>Target Type</th>
    <th>Conversion</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td>Any signed or unsigned integral type</td>
    <td>A larger signed or integral type</td>
    <td>
      The value is converted from the smaller to the equivalent value in the
      larger type.
    </td>
  </tr>
  <tr>
    <td>Any signed or unsigned integral type</td>
    <td>A floating point type</td>
    <td>
      The value is converted from the integral type the closest possible
      floating point value.
    </td>
  </tr>
  <tr>
    <td>A 32-bit floating point value</td>
    <td>A 64-bit floating point value</td>
    <td>
      The value is converted to the closest value possible in the larger type.
    </td>
  </tr>
  </tbody>
</table>

### Explicit Conversions

These conversions must be explicitly done by users by using a casting
expression (Defined in the language grammar).

<table>
  <caption>Explicit conversions</caption>
  <thead>
  <tr>
    <th>Source Type</th>
    <th>Target Type</th>
    <th>Conversion</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td>Any integral type</td>
    <td>Any integral type of smaller size</td>
    <td>
      The resulting value is the larger integral's value reduced <i>modulo 2<sup>N</sup></i>,
      where <i>N</i> is the number of value bits in the target type. The
      resulting bit pattern is interpreted according to the target type's
      signedness.
    </td>
  </tr>
  <tr>
    <td>A 64-bit floating point value</td>
    <td>A 32-bit floating point value</td>
    <td>
      The larger type's value is converted to the closest equivalent value of
      the smaller type.
    </td>
  </tr>
  <tr>
    <td>Any floating point value</td>
    <td>Any integral value</td>
    <td>
      The floating point value is first rounded down, then converted to the
      equivalent integral value.
    </td>
  </tr>
  </tbody>
</table>

<h4 id="boolean-conversion">Boolean Conversions</h4>

The following table defines how values of different types are to be converted
to boolean values. Unless it is stated that a type cannot be converted to a
boolean value in the following table, then any value of that type is
*"boolean-assignable."*

Boolean conversion is not implicit if a value is being assigned to a variable, 
being passed as an argument to a function, method or constructor, being set as 
the value of a class member or a struct property. In such cases, boolean 
conversion must be explicit. In all other cases, boolean conversion is implicit.

<table>
  <caption>Boolean conversions</caption>
  <thead>
  <tr>
    <th>Value</th>
    <th>Boolean Result</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td>Boolean value</td>
    <td>No conversion needed.</td>
  </tr>
  <tr>
    <td>Any arithmetic type value</td>
    <td>Zero values evaluate to false, non-zero values evaluate to true.</td>
  </tr>
  <tr>
    <td>strings/arrays</td>
    <td>
      If the array/string has a length of 0, evaluates to false. Otherwise,
      evaluates to true.
    </td>
  </tr>
  <tr>
    <td>Enums</td>
    <td>
      Enum constants with the ordinal value zero evaluate to false, while non-zero
      ordinal values evaluate to true.
    </td>
  </tr>
  <tr>
    <td>Variants</td>
    <td>
      Variants with the ordinal value zero evaluate to false, while other
      ordinals evaluate to true.
    </td>
  </tr>
  <tr>
    <td>Interfaces</td>
    <td colspan="2">Cannot be evaluated as a boolean value.</td>
  </tr>
  <tr><td>Classes</td></tr>
  <tr><td>Structs</td></tr>
  <tr>
    <td>Nullables</td>
    <td>
      Evaluate to a boolean value corresponding to the presence state of the
      nullable.
    </td>
  </tr>
  </tbody>
</table>

## Type Parameters

Type parameters allow for types to be specified with incomplete types,
allowing them to be filled in later.

When a type is stated to support type parameters it means the type can be
declared with a list of type parameters that act as non-instatiable types.

Type parameters can be limited to which types can be used. These limits are
referred to as *type parameter Constraints.*

<h2 id="limits">Limits</h2>

The following limits are defined for features and aspects of the Tetral
Language.

<table>
  <caption>Language Limits</caption>
  <thead>
  <tr>
    <th>Aspect</th>
    <th>Limit</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td>Maximum number of implemented interfaces</td>
    <td>16</td>
  </tr>
  <tr>
    <td>Maximum number of function/method/constructor declaration arguments</td>
    <td>62</td>
  </tr>
  <tr>
    <td>Maximum number of function/method/constructor call arguments</td>
    <td>62</td>
  </tr>
  <tr>
    <td>Maximum number of enum constants per enum type</td>
    <td>1024</td>
  </tr>
  <tr>
    <td>Maximum number of variants per variant type</td>
    <td>256</td>
  </tr>
  <tr>
    <td>Maximum depth of nested functions</td>
    <td>8</td>
  </tr>
  </tbody>
</table>

# Language

<h3 id="id-Semantics">Identifier Semantics</h3>

An Identifier may denote a function, a struct, an interface, an enum, a variant 
type, a class, a local variable or a global variable. An identifier with an 
identical value may reference a different symbol at different points in a 
program.

A difference must be made between the identifiers used in
<rule>primary-expression</rule>s and identifiers used in other contexts. In a
primary expression, the identifier shall serve as a name that references a
previously declared or imported symbol.

Symbol lookup shall be performed in ascending scopes from the current scopes. 
The order being: Local Scope, Current Function Scope, Global Scope.

<h3 id="overflow">Overflow/Underflow Semantics</h3>

Overflows and underflows happen when an arithmetic type's value exceeds its
maximum representable value, or when its value subceeds it's minimum
representable value.

In such cases, the value shall wrap around without any errors.

In cases where overflow or underflow is detectable by the translation
environment, the user should be warned about it. For example, when assigning
a constant value larger than 255 to a variable of type `uint8`.

## Syntax Notation

References to other syntactic rules are in *italic*, literal values are
in <literal>bold, monospaced font</literal>. An italic syntactic rule followed
by a colon *(:)* defines the rule. Alternative definitions of the rule
are defined on new lines.

The syntax <sgroup modifiers="opt">_x_</sgroup> denotes a part of the grammar 
where _x_ may occur zero or one times. The syntax <sgroup modifiers="opt rep">_x_</sgroup> 
denotes a part of the grammar where _x_ may occur zero or multiple times. The 
syntax <sgroup modifiers="rep">_x_</sgroup> denotes a part of the grammar where 
_x_ may occur one or more times.

Syntax rule definitions followed by a _"one of:"_ mean that any of the specified 
literals are a valid value for the token.

Syntax rule definitions that are written in regular font are used when the 
number of alternative definitions is too great to specify manually.

Basic Syntax Notation Example:
<grammar-def>
<literal>(</literal> <rule modifiers="opt rep">expression</rule> <literal>)</literal>
</grammar-def>

Indicates a Syntax element enclosed with *"()"* which might contain
an expression, or several expressions.

## Lexical Elements
##### Syntax
<grammar-def>
  <rule-def id="token">
    <def><rule>keyword</rule></def>
    <def><rule>identifier</rule></def>
    <def><rule>constant</rule></def>
    <def><rule>string-literal</rule></def>
    <def><rule>operator</rule></def>
  </rule-def>
</grammar-def>

##### Semantics
Lexical analysis shall consume the largest sequence of source characters that
constitutes a valid token.

Tokens, outside of character or string literals, shall ignore all white space.
White space is defined as any Unicode codepoint in the input test with the 
`White_Space` binary property.

Any use of a literal (eg: <literal>const</literal>) in the definition of the
language grammar is case-sensitive and thus must match the literal exactly.

No Unicode normalization is performed on the parsed tokens.

### Keywords
##### Syntax
<grammar-def>
  <rule-def id="keyword">
    <def><rule>real-keyword</rule></def>
    <def><rule>type-keyword</rule></def>
    <def><rule>alias-keyword</rule></def>
    <def><rule>contextual-keyword</rule></def>
  </rule-def>
  <rule-def id="real-keyword" type="oneof">
    <oneof>
      <literal>if</literal>
      <literal>else</literal>
      <literal>break</literal>
      <literal>continue</literal>
      <literal>return</literal>
      <literal>while</literal>
      <literal>for</literal>
      <literal>struct</literal>
      <literal>module</literal>
      <literal>import</literal>
      <literal>export</literal>
      <literal>do</literal>
      <literal>const</literal>
      <literal>assert</literal>
      <literal>native</literal>
      <literal>this</literal>
      <literal>override</literal>
      <literal>static</literal>
      <literal>protected</literal>
      <literal>public</literal>
      <literal>private</literal>
      <literal>constructor</literal>
      <literal>this</literal>
      <literal>super</literal>
      <literal>class</literal>
      <literal>enum</literal>
      <literal>struct</literal>
      <literal>interface</literal>
      <literal>variant</literal>
      <literal>cast</literal>
      <literal>bitcast</literal>
      <literal>extendable</literal>
      <literal>new</literal>
    </oneof>
  </rule-def>
  <rule-def id="contextual-keyword" type="oneof">
    <oneof>
      <literal>from</literal>
      <literal>implements</literal>
      <literal>extends</literal>
      <literal>mutable</literal>
      <literal>readonly</literal>
    </oneof>
  </rule-def>
  <rule-def id="type-keyword" type="oneof">
    <oneof>
      <literal>void</literal>
      <literal>uint8</literal>
      <literal>bool</literal>
      <literal>int8</literal>
      <literal>uint16</literal>
      <literal>int16</literal>
      <literal>uint32</literal>
      <literal>int32</literal>
      <literal>uint64</literal>
      <literal>int64</literal>
      <literal>float32</literal>
      <literal>float64</literal>
      <literal>string</literal>
    </oneof>
  </rule-def>
  <rule-def id="alias-keyword" type="oneof">
    <oneof>
      <literal>boolean</literal>
      <literal>byte</literal>
      <literal>ubyte</literal>
      <literal>short</literal>
      <literal>ushort</literal>
      <literal>int</literal>
      <literal>uint</literal>
      <literal>long</literal>
      <literal>ulong</literal>
      <literal>float</literal>
      <literal>double</literal>
    </oneof>
  </rule-def>
</grammar-def>

##### Semantics
When lexical analysis encounters a sequence which can be both a keyword or
an identifier, then keywords shall take precedence over identifiers.

After lexical analysis, alias keywords shall have the same syntactic meaning
as their corresponding real keywords. For alias token mappings, see
<table-ref target="aliasmappings"></table-ref>.

Contextual keywords shall only be keywords in specific contexts. Those contexts
are defined in the grammar as they appear. Outside the context which will
be defined, <rule>contextual-keyword</rule>s shall be identifiers.

<table id="aliasmappings">
  <caption>Alias token mappings</caption>
  <thead>
  <tr>
    <th>Alias Token</th>
    <th>Mapped Token</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td><b><code>boolean</code></b></td>
    <td><b><code>bool</code></b></td>
  </tr>
  <tr>
    <td><b><code>byte</code></b></td>
    <td><b><code>int8</code></b></td>
  </tr>
  <tr>
    <td><b><code>ubyte</code></b></td>
    <td><b><code>uint8</code></b></td>
  </tr>
  <tr>
    <td><b><code>char</code></b></td>
    <td><b><code>uint8</code></b></td>
  </tr>
  <tr>
    <td><b><code>short</code></b></td>
    <td><b><code>int16</code></b></td>
  </tr>
  <tr>
    <td><b><code>ushort</code></b></td>
    <td><b><code>uint16</code></b></td>
  </tr>
  <tr>
    <td><b><code>int</code></b></td>
    <td><b><code>int32</code></b></td>
  </tr>
  <tr>
    <td><b><code>uint</code></b></td>
    <td><b><code>uint32</code></b></td>
  </tr>
  <tr>
    <td><b><code>long</code></b></td>
    <td><b><code>int64</code></b></td>
  </tr>
  <tr>
    <td><b><code>ulong</code></b></td>
    <td><b><code>uint64</code></b></td>
  </tr>
  </tbody>
</table>

### Identifiers
##### Syntax
<grammar-def>
  <rule-def id="identifier">
    <def>
      <rule>identifier-start</rule>
      <rule modifiers="opt rep">identifier-continue</rule>
    </def>
  </rule-def>

  <rule-def id="identifier-start">
    <def><rule>nondigit</rule></def>
    <def>XID_Start character (Defined by Unicode)</def>
  </rule-def>

  <rule-def id="identifier-continue">
    <def><rule>digit</rule></def>
    <def><rule>nondigit</rule></def>
    <def>XID_Continue character (Defined by Unicode)</def>
  </rule-def>

  <rule-def id="digit" type="oneof">
    <oneof>
      <literal>0 1 2 3 4 5 6 7 8 9</literal>
    </oneof>
  </rule-def>

  <rule-def id="nondigit" type="oneof">
    <oneof>
      <literal>_ $ a b c d e f g h i j k l m n o p q r s t u v w x y z A B C D E F G H I J K L M N O P Q R S T U V W X Y Z</literal>
    </oneof>
  </rule-def>
</grammar-def>

##### Constraints
Identifiers must reference a valid symbol that is accessible in the current
semantic context. (Lookup Semantics defined in <chapter-ref target="id-Semantics"></chapter-ref>.)

##### Semantics
A symbol lookup is performed as defined in <chapter-ref target="id-Semantics"></chapter-ref>.

The result of an identifier expression, is value of the symbol it is  
referencing.

An identifier which references a valid semantic variable or a constant is a
valid lvalue. If the value it references is mutable, the result is a valid
mutable lvalue.

### Constants
##### Syntax
<grammar-def>
  <rule-def id="constant">
    <def><rule>integer-constant</rule></def>
    <def><rule>floating-point-constant</rule></def>
    <def><rule>character-constant</rule></def>
    <def><rule>predefined-constant</rule></def>
  </rule-def>
</grammar-def>

#### Integer Constants
##### Syntax
<grammar-def>
  <rule-def id="integer-constant">
    <def>
      <rule modifiers="opt">sign</rule>
      <rule>decimal-integer-constant</rule>
    </def>
    <def>
      <rule modifiers="opt">sign</rule>
      <rule>octal-constant</rule>
    </def>
    <def>
      <rule modifiers="opt">sign</rule>
      <rule>hexadecimal-constant</rule>
    </def>
    <def>
      <rule modifiers="opt">sign</rule>
      <rule>binary-constant</rule>
    </def>
  </rule-def>

  <rule-def id="sign" type="oneof">
    <def><literal>+ -</literal></def>
  </rule-def>

  <rule-def id="integer-suffix" type="oneof">
    <def>
      <literal>i</literal>
      <literal>I</literal>
      <literal>u</literal>
      <literal>U</literal>
      <literal>l</literal>
      <literal>L</literal>
      <literal>UL</literal>
      <literal>ul</literal>
      <literal>uL</literal>
      <literal>Ul</literal>
      <literal>b</literal>
      <literal>B</literal>
      <literal>ub</literal>
      <literal>UB</literal>
      <literal>uB</literal>
      <literal>Ub</literal>
      <literal>s</literal>
      <literal>S</literal>
      <literal>us</literal>
      <literal>US</literal>
      <literal>uS</literal>
      <literal>Us</literal>
    </def>
  </rule-def>

  <rule-def id="octal-constant">
    <def>
      <literal>0o</literal>
      <rule>octal-sequence</rule>
      <rule modifiers="opt">integer-suffix</rule>
    </def>
    <def>
      <literal>0O</literal>
      <rule>octal-sequence</rule>
      <rule modifiers="opt">integer-suffix</rule>
    </def>
  </rule-def>
  <rule-def id="octal-sequence" type="oneof">
    <def>
      <rule>octal-digit</rule> <sgroup modifiers="opt rep"><rule modifiers="opt">underscore</rule> <rule>octal-digit</rule></sgroup>
    </def>
  </rule-def>
  <rule-def id="octal-digit" type="oneof">
    <def>
      <literal>0 1 2 3 4 5 6 7</literal>
    </def>
  </rule-def>
  <rule-def id="hexadecimal-constant">
    <def>
      <literal>0x</literal>
      <rule>hexadecimal-sequence</rule>
      <rule modifiers="opt">integer-suffix</rule>
    </def>
    <def>
      <literal>0X</literal>
      <rule>hexadecimal-sequence</rule>
      <rule modifiers="opt">integer-suffix</rule>
    </def>
  </rule-def>
  <rule-def id="hexadecimal-sequence">
    <def>
      <rule>hexadecimal-sequence</rule>
      <sgroup modifiers="opt rep">
        <rule modifiers="opt">underscore</rule>
        <rule>hexadecimal-digit</rule>
      </sgroup>
    </def>
  </rule-def>
  <rule-def id="hexadecimal-digit" type="oneof">
    <def>
      <literal>0 1 2 3 4 5 6 7 8 9 a b c d e f A B C D E F</literal>
    </def>
  </rule-def>

  <rule-def id="binary-constant">
    <def>
      <literal>0b</literal>
      <rule>binary-sequence</rule>
      <rule modifiers="opt">integer-suffix</rule>
    </def>
    <def>
      <literal>0B</literal>
      <rule>binary-sequence</rule>
      <rule modifiers="opt">integer-suffix</rule>
    </def>
  </rule-def>
  <rule-def id="binary-sequence">
    <def>
      <rule>binary-digit</rule>
      <sgroup modifiers="opt rep">
        <rule modifiers="opt">underscore</rule>
        <rule>binary-digit</rule>
      </sgroup>
    </def>
  </rule-def>
  <rule-def id="binary-digit" type="oneof">
    <def>
      <literal>0 1</literal>
    </def>
  </rule-def>

  <rule-def id="decimal-integer-constant">
    <def>
      <rule>digit-sequence</rule>
      <rule modifiers="opt">integer-suffix</rule>
    </def>
  </rule-def>
  <rule-def id="digit-sequence">
    <def><rule>digit</rule></def>
    <def>
      <rule>digit-sequence</rule>
      <sgroup modifiers="opt rep">
        <rule modifiers="opt">underscore</rule>
        <rule>digit</rule>
      </sgroup>
    </def>
  </rule-def>

  <rule-def id="underscore">
    <def><literal>_</literal></def>
  </rule-def>
</grammar-def>

##### Constraints
Unsuffixed integer constants shall not represent a value that exceeds the
maximum value of an unsigned 64-bit integer.

Suffixed integer constants shall not represent a value that exceeds the
suffix specifier's type. (See <table-ref target="intsuffixes"></table-ref>.)

Any integer constant with the value of <literal>-0</literal> shall be invalid.

##### Semantics
Unsuffixed integer constants shall result in one of three types of integral 
types based on the smallest type that can hold the constant value. 
(See <table-ref target="unsuffixedints"></table-ref>.)

Suffixed integer constants shall result in a value with the integral type 
specified by the suffix. (See <table-ref target="intsuffixes"></table-ref>.)

<table id="intsuffixes">
  <caption>Suffix type mappings</caption>
  <thead>
  <tr>
    <th>Suffix</th>
    <th>Mapped Type</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td><literal>b</literal>, <literal>B</literal></td>
    <td><code>int8</code></td>
  </tr>
  <tr>
    <td><literal>s</literal>, <literal>S</literal></td>
    <td><code>int16</code></td>
  </tr>
  <tr>
    <td><literal>i</literal>, <literal>I</literal></td>
    <td><code>int32</code></td>
  </tr>
  <tr>
    <td><literal>l</literal>, <literal>L</literal></td>
    <td><code>int64</code></td>
  </tr>
  <tr>
    <td><literal>ub</literal>, <literal>UB</literal>, <literal>uB</literal>, <literal>Ub</literal></td>
    <td><code>uint8</code></td>
  </tr>
  <tr>
    <td><literal>us</literal>, <literal>US</literal>, <literal>uS</literal>, <literal>Us</literal></td>
    <td><code>uint16</code></td>
  </tr>
  <tr>
    <td><literal>u</literal>, <literal>U</literal>, <literal>ui</literal>, <literal>UI</literal>, <literal>uI</literal>, <literal>Ui</literal></td>
    <td><code>uint32</code></td>
  </tr>
  <tr>
    <td><literal>ul</literal>, <literal>UL</literal>, <literal>uL</literal>, <literal>Ul</literal></td>
    <td><code>uint64</code></td>
  </tr>
  </tbody>
</table>

<table id="unsuffixedints" style="margin-top: 5mm;">
  <caption>Unsuffixed integer types</caption>
  <thead>
  <tr>
    <th>Minimum Value</th>
    <th>Maximum Value</th>
    <th>Resulting Type</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td>-2147483648</td>
    <td>2147483647</td>
    <td><code>int32</code></td>
  </tr>
  <tr>
    <td>2147483648</td>
    <td>9223372036854775807</td>
    <td rowspan="2"><code>int64</code></td>
  </tr>
  <tr>
    <td>-9223372036854775808</td>
    <td>-2147483649</td>
  </tr>
  <tr>
    <td>9223372036854775808</td>
    <td>18446744073709551615</td>
    <td><code>uint64</code></td>
  </tr>
  </tbody>
</table>

#### Floating Point Constants
##### Syntax
<grammar-def>
  <rule-def id="floating-point-constant">
    <def>
      <rule modifiers="opt">sign</rule>
      <rule>fractional-part</rule>
      <rule modifiers="opt">exponent-part</rule>
      <rule modifiers="opt">floating-point-suffix</rule>
    </def>
  </rule-def>

  <rule-def id="fractional-part">
    <def><rule>digit-sequence</rule></def>
    <def>
      <rule>digit-sequence</rule>
      <literal>.</literal>
      <rule>digit-sequence</rule>
    </def>
    <def>
      <rule>digit-sequence</rule>
      <literal>.</literal>
    </def>
    <def>
      <literal>.</literal>
      <rule>digit-sequence</rule>
    </def>
  </rule-def>

  <rule-def id="exponent-part">
    <def>
      <literal>e</literal>
      <rule modifiers="opt">sign</rule>
      <rule>digit-sequence</rule>
    </def>
    <def>
      <literal>E</literal>
      <rule modifiers="opt">sign</rule>
      <rule>digit-sequence</rule>
    </def>
  </rule-def>

  <rule-def id="floating-point-suffix" type="oneof">
    <def>
      <literal>f</literal>
      <literal>F</literal>
      <literal>d</literal>
      <literal>D</literal>
    </def>
  </rule-def>
</grammar-def>

##### Constraints
An unsuffixed floating point constant must contain a valid floating point
value that can be represented as a 64-bit floating point value.

A suffixed floating point constant must contain a valid floating value that
can be represented by the type specified by the suffix. (See <table-ref target="floatsuffixes"></table-ref>.)

Hexadecimal/Octal/Binary floating point numbers are explicitly not
supported in Tetral grammar.

##### Semantics
The result of an unsuffixed floating point constant shall be a 64-bit floating
point value.

The result of a suffixed floating point constant shall be a floating point value
of the type matching the suffix. (See <table-ref target="floatsuffixes"></table-ref>.)

<table id="floatsuffixes">
  <caption>Floating point suffix type table</caption>
  <thead>
  <tr>
    <th>Suffixes</th>
    <th>Type</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td><literal>f</literal>, <literal>F</literal></td>
    <td><code>float32</code></td>
  </tr>
  <tr>
    <td><literal>d</literal>, <literal>D</literal></td>
    <td><code>float64</code></td>
  </tr>
  </tbody>
</table>

#### Character Constants
##### Syntax
<grammar-def>
  <rule-def id="character-constant">
    <def>
      <literal>'</literal>
      <rule>char-sequence</rule>
      <literal>'</literal>
    </def>
  </rule-def>

  <rule-def id="char-sequence">
    <def>
      Any valid Unicode codepoint except the single-quote, backslash or newline character
    </def>
    <def><rule>escape-sequence</rule></def>
  </rule-def>

  <rule-def id="escape-sequence">
    <def><rule>simple-escape-sequence</rule></def>
    <def><rule>hex-escape-sequence</rule></def>
  </rule-def>

  <rule-def id="simple-escape-sequence" type="oneof">
    <def><literal>\' \" \\ \t \r \n \T \R \N \$</literal></def>
  </rule-def>

  <rule-def id="hex-escape-sequence">
    <def>
      <literal>\u</literal>
      <rule modifiers="rep">hexadecimal-digit</rule>
    </def>
    <def>
      <literal>\U</literal>
      <rule modifiers="rep">hexadecimal-digit</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints
A character constant's contained codepoint must be a valid Unicode
codepoint.

A hexadecimal escape sequence shall not contain more than 6 hexadecimal 
digits.

##### Semantics
Character constants result in a value of a 32-bit unsigned integer type,
representing the Unicode codepoint of the character.

An escaped sequence shall lead to the escaped character's value being used. See
<table-ref target="charescapetable"></table-ref>.

<table id="charescapetable">
  <caption>String/Character escape sequence values</caption>
  <thead>
  <tr>
    <th>Escape Sequence</th>
    <th>Resulting codepoint name.</th>
    <th>Unicode codepoint.</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td><literal>\'</literal></td>
    <td>Single quote character</td>
    <td>U+0027</td>
  </tr>
  <tr>
    <td><literal>\"</literal></td>
    <td>Double quote character</td>
    <td>U+0022</td>
  </tr>
  <tr>
    <td><literal>\\</literal></td>
    <td>Slash character</td>
    <td>U+002F</td>
  </tr>
  <tr>
    <td><literal>\t</literal>, <literal>\T</literal></td>
    <td>Tabulation character</td>
    <td>U+0009</td>
  </tr>
  <tr>
    <td><literal>\n</literal>, <literal>\N</literal></td>
    <td>Linefeed character</td>
    <td>U+000A</td>
  </tr>
  <tr>
    <td><literal>\r</literal>, <literal>\R</literal></td>
    <td>Carriage Return character</td>
    <td>U+000D</td>
  </tr>
  <tr>
    <td><literal>\$</literal></td>
    <td>Dollar Sign character</td>
    <td>U+0024</td>
  </tr>
  </tbody>
</table>

#### Predefined Constants
##### Syntax
<grammar-def>
  <rule-def id="predefined-constant">
    <def><literal>true</literal></def>
    <def><literal>false</literal></def>
    <def><literal>null</literal></def>
    <def><literal>nan</literal></def>
    <def><literal>inf</literal></def>
    <def><literal>-inf</literal></def>
    <def><literal>+inf</literal></def>
  </rule-def>
</grammar-def>

##### Semantics
The result of the <literal>true</literal> and <literal>false</literal>
keywords shall be a boolean value of the corresponding value.

The result of the <literal>null</literal> value shall be a nullable value with a
false presence state value. A <literal>null</literal> value can be implicitly 
cast to any nullable type.

The result of the <literal>nan</literal> keyword shall be a 32-bit floating 
point value with the special Not-A-Number value.

The result of the <literal>inf</literal>, <literal>-inf</literal> and
<literal>+inf</literal> keywords shall be 32-bit floating point value with an
infinite value of the corresponding signedness. If no sign is specified,
then the result shall be the same as with the <literal>+</literal> sign.

### Operators
##### Syntax
<grammar-def>
  <rule-def id="operator" type="oneof">
    <def>
      <literal>
        ( ) { } [ ] : ; , . ... & &= && &&= | |= * *= / /= + += - -= ^ ^=
        % %= << <<= >> >>= < <= > >= ++ -- == != = ! ~ => ** **= || ||= ?
        ?? ??= ?. !. ::
      </literal>
    </def>
  </rule-def>
</grammar-def>

### Semicolons
##### Syntax
<grammar-def>
  <rule-def id="semicolon">
    <def><literal>;</literal></def>
  </rule-def>
</grammar-def>

##### Semantics
The semicolon as a marker for the end of an expression or for a statement shall 
be completely optional and need not be used unless there may be ambiguity in
the syntax.

Certain syntactic elements (For example, the <rule>for-loop-statement</rule>)
explicitly use semicolons to delimit parts of the grammar. In such cases the
semicolon shall be required.

### Comments

Except within a string or character literal, the characters <literal>//</literal> 
and <literal>#</literal> denote the beginning of a line comment. The comment 
consumes the rest of the source text's line, or until the end of input has been 
reached.

Except within a string or character literal, the characters <literal>/\*</literal> denote
the beginning of a block comment. The comment consumes input until a matching
<literal>\*/</literal> sequence has been found, or until the end of input has
been reached.

Except within a string or character literal, the characters
<literal>/**</literal> denote the beginning of a documentation comment. The
comment consumes input until a matching <literal>*/</literal> sequence has
been found, or until the end of input has been reached.

In almost all cases, comments may be simply skipped over and ignored, except for
documentation comments (Starting with <literal>/**</literal>) which may be 
linked to the specific <rule>declaration</rule> that they prefix. This may be 
ignored by implementations that do not generate documentation or otherwise make 
use of user-written documentation.

## Expressions
### Primary Expressions
##### Syntax
<grammar-def>
  <rule-def id="primary-expression">
    <def><rule>constant</rule></def>
    <def><rule>identifier</rule></def>
    <def><rule>object-literal</rule></def>
    <def><rule>array-literal</rule></def>
    <def><rule>string-literal</rule></def>
    <def><rule>cast-expression</rule></def>
    <def><rule>super-expression</rule></def>
    <def><rule>this-expression</rule></def>
    <def><rule>new-expression</rule></def>
    <def><rule>switch-expression</rule></def>
    <def><literal>(</literal> <rule>expression</rule> <literal>)</literal></def>
  </rule-def>
</grammar-def>

#### New Expression

##### Syntax

<grammar-def>
  <rule-def id="new-expression">
    <def><rule>object-instantiation-expression</rule></def>
    <def><rule>array-instantiation-expression</rule></def>
  </rule-def>

  <rule-def id="object-instantiation-expression">
    <def><literal>new</literal> <rule>function-call</rule></def>
    <def><literal>new</literal> <rule>type-name-expression</rule> <rule modifiers="opt">function-call</rule></def>
  </rule-def>

  <rule-def id="array-instantiation-expression">
    <def>
      <literal>new</literal>
      <rule modifiers="opt">type-expression</rule>
      <literal>[</literal>
      <rule>expression</rule>
      <literal>]</literal>
    </def>
    <def>
      <literal>new</literal>
      <rule modifiers="opt">type-expression</rule>
      <literal>[</literal>
      <rule>expression</rule>
      <literal>]</literal>
      <rule>function-call</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints
New expressions shall only be used to instantiate structs, classes and arrays.

##### Semantics
A new-expression shall instantiate a new instance of a specific type.

If the type name was not specified, the type must be inferred from the
surrounding context.

##### Object Instantiation
##### Constraints
The specified arguments must match a constructor that exists on the type.

##### Semantics
The object instantiation expression shall instantiate an object by calling the 
appropriate constructor if it is constructing a class.

If the object being instatiated is a struct, then no arguments shall be 
specified.

##### Array Instantiation

##### Constraints
The specified expression must result in a value that can be implictly
converted to an unsigned 32-bit integer, this expression's result will be
referred to as the instantiated array's length.

The array type must be default initialize-able.

##### Semantics
Instantiates an array of the defined length and initializes each value in
the created array to the array type's default initialized value.

#### 'Super' Expression
##### Syntax
<grammar-def>
  <rule-def id="super-expression">
    <def><literal>super</literal></def>
  </rule-def>
</grammar-def>

##### Constraints
The super expression shall only be used inside an object type's method body or 
constructor body.

The super expression shall only be used inside an object type which has a parent 
type.

##### Semantics
The result of the expression shall be a reference to the instance of the parent 
of the class in which the expression was used.

Any members which are accessed through the <literal>super</literal> 
keyword shall not be redirected to any members of the current class which 
override the parent class' members.

#### 'This' Expression
##### Syntax
<grammar-def>
  <rule-def id="this-expression">
    <def><literal>this</literal></def>
  </rule-def>
</grammar-def>

##### Constraints
This expression shall only be used inside an object type's method body or 
constructor body.

##### Semantics
The result of the expression shall be a reference to the instance of the class 
in which the expression was used.

#### Cast Expression
##### Syntax
<grammar-def>
  <rule-def id="cast-expression">
    <def><rule>value-cast-expression</rule></def>
    <def><rule>bit-cast-expression</rule></def>
  </rule-def>

  <rule-def id="value-cast-expression">
    <def>
      <literal>cast</literal>
      <literal>(</literal>
      <rule>type-expression</rule>
      <literal>,</literal>
      <rule>expression</rule>
      <literal>)</literal>
    </def>
  </rule-def>

  <rule-def id="bit-cast-expression">
    <def>
      <literal>bitcast</literal>
      <literal>(</literal>
      <rule>type-expression</rule>
      <literal>,</literal>
      <rule>expression</rule>
      <literal>)</literal>
    </def>
  </rule-def>
</grammar-def>

##### Constraints
Regular cast expressions shall only convert a value to a specified type if the 
type of the value resulting from the expression can be implcitly or explicitly
converted to the specified type.
(See <chapter-ref target="type-conversions"></chapter-ref>.)

Bit cast expressions shall only be performed with an expression that results in 
an arithmetic value and shall only allow casting from that arithmetic value to 
another arithmetic type of the same size as the expression value's resulting 
type.

##### Semantics

A regular casting expression shall return a value of the specified type by 
performing either an implicit or explicit conversion on the value resulting from 
the expression.

A bit casting expression shall return a value of the specified type by simply 
treating bits of the value resulting from the expression as a value of the 
specified type.

#### Object Literals
##### Syntax
<grammar-def>
  <rule-def id="object-literal">
    <def>
      <literal>{</literal>
      <rule modifiers="opt">object-literal-property-list</rule>
      <literal>}</literal>
    </def>
  </rule-def>
  <rule-def id="object-literal-property-list">
    <def>
      <rule>object-literal-property-list</rule>
      <sgroup modifiers="opt rep">
        <literal>,</literal>
        <rule>object-literal-property</rule>
      </sgroup>
      <sgroup modifiers="opt"><literal>,</literal></sgroup>
    </def>
  </rule-def>
  <rule-def id="object-literal-property">
    <def>
      <rule>identifier</rule>
      <sgroup modifiers="opt">
        <literal>:</literal>
        <rule>expression</rule>
      </sgroup>
    </def>
  </rule-def>
</grammar-def>

##### Constraints
If an object literal's struct type cannot be inferred from the surrounding
context, then the expression shall be invalid.

An object literal shall only initialize properties that exist on the struct
type.

An object literal shall not declare any duplicate properties.

Object literals shall not be used to initialize class values.

If an object literal property omits value expression, then a symbol with the
name specified by the identifier must exist in the current semantic context.

##### Semantics
The type of struct initialized by an object literal must be inferred from
the surrounding context. If the object literal is being assigned to a property 
of a struct or variant, or if the object literal is being assigned to a variable
or class field, the inferred type shall be the assigned object's type. If the 
object literal is used as a return value in a <rule>return-statement</rule> then
the inferred type shall be the function's return type.

An object literal expression shall result in a value of an inferred struct type
with each of the struct value's properties being set to the values specified.

If an object literal property omits the value expression, then it shall be 
semantically equivalent to assigning a property with the name of the identifier 
to a symbol with the same as the identifier. 

#### Array Literals
##### Syntax

<grammar-def>
 <rule-def id="array-literal">
   <def>
     <literal>[</literal>
     <rule modifiers="opt">array-literal-values</rule>
     <literal>]</literal>
   </def>
 </rule-def>
  <rule-def id="array-literal-values">
    <def>
      <rule>expression</rule>
      <sgroup modifiers="opt rep">
        <literal>,</literal>
        <rule>expression</rule>
      </sgroup>
      <sgroup modifiers="opt"><literal>,</literal></sgroup>
    </def>
  </rule-def>
</grammar-def>

##### Constraints
If an array literal's type cannot be inferred from the surrounding semantic 
context, then the expression shall be invalid.

##### Semantics
The type of the array initialized by an array literal must be inferred from the 
surrounding context. The semantics for inferring the component type shall be the
same as inferring an object literal's type.

Semantically, an array literal is identical to constructing the array with
a <rule>new-expression</rule> and setting each element separately.

#### String Literals
##### Syntax
<grammar-def>
  <rule-def id="string-literal">
    <def><rule>line-string-literal</rule></def>
    <def><rule>multiline-string-literal</rule></def>
  </rule-def>

  <rule-def id="line-string-literal">
    <def>
      <literal>"</literal>
      <rule modifiers="opt">line-string-content</rule>
      <literal>"</literal>
    </def>
  </rule-def>

  <rule-def id="line-string-content">
    <def><rule>line-string-character</rule></def>
    <def>
      <rule>line-string-content</rule>
      <rule>line-string-character</rule>
    </def>
    <def>
      <rule>line-string-content</rule>
      <rule>string-template</rule>
    </def>
  </rule-def>

  <rule-def id="multiline-string-literal">
    <def>
      <literal>"""</literal>
      <rule modifiers="opt">multiline-string-content</rule>
      <literal>"""</literal>
    </def>
  </rule-def>

  <rule-def id="multiline-string-content">
    <def><rule>multiline-string-character</rule></def>
    <def>
      <rule>multiline-string-content</rule>
      <rule>multiline-string-character</rule>
    </def>
    <def>
      <rule>multiline-string-content</rule>
      <rule>string-template</rule>
    </def>
  </rule-def>

  <rule-def id="string-template">
    <def><literal>$</literal><rule>identifier</rule></def>
    <def><literal>${</literal><rule>expression</rule><literal>}</literal></def>
  </rule-def>

  <rule-def id="line-string-character">
    <def>Any valid Unicode codepoint except ", \, $ or newline character.</def>
    <def><rule>escape-sequence</rule></def>
  </rule-def>

  <rule-def id="multiline-string-character">
    <def>Any valid Unicode codepoint except \ or $, provided it is not the start of three consecutive " characters.</def>
    <def><rule>escape-sequence</rule></def>
  </rule-def>
</grammar-def>

##### Constraints
All expressions and identifiers declared inside a string shall return a
non-void value.

A template of the form <literal>$</literal><rule>identifier</rule> must not 
have any white space between the dollar sign character and the start of the 
identifier.

##### Semantics
A string literal shall always result in a value of the String type.

It can be assumed that each line in a multiline string will have some level
of indentation. After parsing, this indentation must be stripped from the
start of each line. Since indentation can vary from line to line, the amount
indentation removed depends on the line with the least indentation.

The template of the form <literal>$</literal><rule>identifier</rule> shall be 
semantically identical to a template of the form 
<literal>${</literal><rule>identifier</rule><literal>}</literal>.

If a string contains any templates it is considered a _templated string._ 
Otherwise, if a string literal contains no templates, it is considered a 
_non-templated string._ Templated strings are made up of the following parts:
1. A _string head,_ which is the part of the string's content up to the first 
   template.
2. A _template._
3. For each additional template, a _string part_ which is the part of the 
   string between two templates, followed by another template.
4. A _string tail,_ which is the part of the string's content from the end of 
   the last template until the end of the string's content.

A string head, string tail and each string part, may be empty. A templated 
string contains exactly one string head and tail and one more template than it 
has string parts.

##### Evaluation
Templated strings are evaluated in order, beginning from the head. Each
template is evaluated and the string representation of the value resulting from 
the evaluation is then appended to the resulting string. 

After a template has been evaluated, evaluation of the string moves on to the 
next part of the string. If the next part is the tail, the tail's content is 
appended to the resulting string and evaluation ends. Otherwise, the next string
part is appended to the resulting string and the next template is then 
evaluated. 

### Trail Expressions

##### Syntax

<grammar-def>
  <rule-def id="trail-expression">
    <def><rule>primary-expression</rule></def>
    <def><rule>property-access-expression</rule></def>
    <def><rule>index-access-expression</rule></def>
    <def><rule>function-call-expression</rule></def>
    <def><rule>coalescence-expression</rule></def>
  </rule-def>
</grammar-def>

### Index Access Expression
##### Syntax
<grammar-def>
  <rule-def id="index-access-expression">
    <def>
      <rule>trail-expression</rule>
      <literal>[</literal>
      <rule>expression</rule>
      <literal>]</literal>
    </def>
  </rule-def>
</grammar-def>

##### Constraints
The type of value returned by the <rule>trail-expression</rule> must be a value 
of an indexable type.

The indexer _expression_ must result in a value of the type that is used to 
index into the indexable operand's value.

##### Semantics
The value returned by an index access expression shall be of the indexed type of 
the object being indexed into. 

A valid index access expression is a valid lvalue. Accessing a non-immutable 
array shall be a valid mutable lvalue.

If the type of value being indexed into is a string or an array, and the index 
is beyond the length of that value, then it shall be a runtime error to access 
the element.

### Property Access Expression
##### Syntax
<grammar-def>
  <rule-def id="property-access-expression">
    <def>
      <rule>trail-expression</rule>
      <literal>.</literal>
      <rule>identifier</rule>
    </def>
    <def>
      <rule>trail-expression</rule>
      <literal>?.</literal>
      <rule>identifier</rule>
    </def>
    <def>
      <rule>trail-expression</rule>
      <literal>!.</literal>
      <rule>identifier</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. The property being accessed must exist on the object operand.
2. A property access must not violate class/interface access Semantics.
3. The <literal>.</literal> operator cannot be used on a nullable operand.
   Either the <literal>!.</literal> or <literal>?.</literal> operator must be
   used by the user to acknowledge the nullability value.

##### Semantics

1. The result of the <literal>.</literal> and <literal>!.</literal> operator
   is a copy of the value of the property or virtual property being accessed.
2. The result of the <literal>?.</literal> operator is a nullable copy of the
   value of the property or virtual property being accessed. If the object
   operand is an empty nullable, then the resulting value is an empty nullable.
3. Accessing a property of a nullable type with the <literal>?.</literal>
   operator causes the nullable to be flattened.
4. A valid property access expression is a valid lvalue.

##### Runtime Errors

1. It is a runtime error if the object operand is an empty nullable value.

### Function Call Expression

##### Syntax

<grammar-def>
  <rule-def id="function-call-expression">
    <def>
      <rule>trail-expression</rule>
      <rule>function-call</rule>
    </def>
  </rule-def>
  <rule-def id="function-call">
    <rule modifiers="opt">type-parameter-instatiation</rule>
    <literal>(</literal>
    <rule modifiers="opt">arguments-list</rule>
    <literal>)</literal>
  </rule-def>
  <rule-def id="arguments-list">
    <def><rule>expression</rule></def>
    <def>
      <rule>arguments-list</rule>
      <literal>,</literal>
      <rule>expression</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. The value returned by the target *trail-expression* must be a function.
2. All arguments passed to the function must be assignable to that function's
   declared arguments.
3. All type parameters passed to the function must conform with any type
   paramater Constraints the function declared.

##### Semantics

1. Invokes a function with the specified arguments.
2. Calling arguments are evaluated from left to right.
3. The value returned by the expression is dependent on the return type of the
   function being invoked.
4. When the <rule>trail-expression</rule> matches multiple overloading
   functions, the one that would require the least number of type conversions
   is selected.

### Coalescence Expression

##### Syntax

<grammar-def>
  <rule-def id="coalescence-expression">
    <def><rule>trail-expression</rule></def>
    <def>
      <rule>trail-expression</rule>
      <literal>??</literal>
      <rule>expression</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. The left operand must be a nullable value.
2. The right operand must be assignable to the left operand, or be a
   non-nullable value of an assignable type to the left operand.

##### Semantics

1. The result of the <literal>??</literal> operator is the left operand if it
   is present. Otherwise, the result of the operator is the right operand.
2. If the left operand is returned, the right operand must not be evaluated.

### Unary Expressions

##### Syntax

<grammar-def>
  <rule-def id="unary-expression">
    <def><rule>trail-expression</rule></def>
    <def><rule>unary-increment-expression</rule></def>
    <def><rule>unary-decrement-expression</rule></def>
    <def><rule>unary-arithmetic-expression</rule></def>
    <def><rule>unary-bitwise-negation-expression</rule></def>
    <def><rule>unary-logical-negation-expression</rule></def>
  </rule-def>
</grammar-def>

#### Unary Increment Expressions

##### Syntax

<grammar-def>
  <rule-def id="unary-increment-expression">
    <def>
      <literal>++</literal>
      <rule>unary-expression</rule>
    </def>
    <def>
      <rule>unary-expression</rule>
      <literal>++</literal>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. The operand must be a valid lvalue that can be modified.
2. The operand must be of an integral or floating point type.

##### Semantics

1. If the increment operator is placed before the operand, the result is the
   value of the operand incremented by 1. As a side effect, the resulting
   value is written to the operand object.
2. If the increment operator is placed after the operand, the result is the
   value of the operand. As a side effect, the operand's value is incremented
   by 1 and written to the operand object.

#### Unary Decrement Expressions

##### Syntax

<grammar-def>
  <rule-def id="unary-decrement-expression">
    <def>
      <literal>--</literal>
      <rule>unary-expression</rule>
    </def>
    <def>
      <rule>unary-expression</rule>
      <literal>--</literal>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. The operand must be a valid lvalue that can be modified.
2. The operand must be of an integral or floating point type.

##### Semantics

1. If the decrement operator is placed before the operand, the result is the
   value of the operand decremented by 1. As a side effect, the resulting
   value is written to the operand object.
2. If the decrement operator is placed after the operand, the result is the
   value of the operand. As a side effect, the operand's value is decremented
   by 1 and written to the operand object.

#### Unary Arithmetic Expressions

##### Syntax

<grammar-def>
  <rule-def id="unary-arithmetic-expression">
    <def><literal>-</literal> <rule>unary-expression</rule></def>
    <def><literal>+</literal> <rule>unary-expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. For the <literal>-</literal> operator, the operand must be of an
   arithmetic type.
2. For the <literal>+</literal> operator, the operand must be of an
   arithmetic type or a boolean. (Not boolean-assignable, an explicit boolean.)

##### Semantics

1. The result of the **-** operator is the negative of the operand's value,
   or positive, if the operand's value is already negative. If the operand's
   type an unsigned type, the resulting type is a signed type of the same size.
2. The result of the **+** operator, for arithmetic values, is the value of
   the operand.
3. The result of the **+** operator, for boolean values, is the value 0, if
   the boolean value is false, otherwise the result is 1.

#### Unary Bitwise Negation Expressions

##### Syntax

<grammar-def>
  <rule-def id="unary-bitwise-negation-expression">
    <def><literal>~</literal> <rule>unary-expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. The operand must be a valid lvalue.
2. The operand must be of an integral type.

##### Semantics

1. The result of the expression is the value of the operand with all the
   bits flipped (All zeroes set to ones and vice versa)

#### Unary Logical Negation Expressions

##### Syntax

<grammar-def>
  <rule-def id="unary-logical-negation-expression">
    <def><literal>!</literal> <rule>unary-expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. The operand's value must be boolean-assignable. (Defined in <chapter-ref target="boolean-conversion"></chapter-ref>.)

##### Semantics

1. The result of the <literal>!</literal> operator is the value of the operand,
   converted to a boolean, and then the value inverted.

### Power (POW) Expression

##### Syntax

<grammar-def>
  <rule-def id="power-expression">
    <def><rule>unary-expression</rule></def>
    <def><rule>power-expression</rule> <literal>**</literal> <rule>unary-expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. Both operands must be of a compatible arithmetic type.

##### Semantics

1. The usual arithmetic conversions are applied.
2. The result of the **\*\*** operator is the left operand raised to the
   power of the right operand.

### Multiplicative Expressions

##### Syntax

<grammar-def>
  <rule-def id="multiplicative-expression">
    <def><rule>power-expression</rule></def>
    <def><rule>multiplicative-expression</rule> <literal>*</literal> <rule>power-expression</rule></def>
    <def><rule>multiplicative-expression</rule> <literal>/</literal> <rule>power-expression</rule></def>
    <def><rule>multiplicative-expression</rule> <literal>%</literal> <rule>power-expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. Both operands must be of a compatible arithmetic type.
2. In the case of the <literal>*</literal> operator, if the left operator is
   a string, the right operand must be an integral.

##### Semantics

1. The usual arithmetic conversions are applied.
2. The result of the <literal>*</literal> operator, when applied to two arithmetic types,
   is the left operand multiplied by the right operand.
3. The result of the <literal>*</literal> operator, when applies to a string operand and
   an integral operand, is the value of the string operand with its content
   repeated an amount of times specified by the integral operand.
4. The result of the <literal>/</literal> operator is the left operand divided by the
   right operand.
5. The result of the <literal>%</literal> operator is the remainder of dividing the left
   operand by the right operand.

### Additive Expressions

##### Syntax

<grammar-def>
  <rule-def id="additive-expression">
    <def><rule>multiplicative-expression</rule></def>
    <def><rule>additive-expression</rule> <literal>+</literal> <rule>multiplicative-expression</rule></def>
    <def><rule>additive-expression</rule> <literal>-</literal> <rule>multiplicative-expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. For the <literal>-</literal> operator, both operands must be a compatible
   arithmetic type.
2. For the <literal>+</literal> operator, either both operands must be of a
   compatible arithmetic type, or the left operand must be a string, and the
   other operand must be a non-void value.

##### Semantics

1. The usual arithmetic conversions are applied.
2. The result of the <literal>+</literal> operator, when both operands are arithmetic, is
   the left operand plus the right operand.
3. The result of the <literal>+</literal> operator, when the left operand is a string, is
   the string operand's string value concatenated with the string
   representation of the other operand. (See
   <chapter-ref target="strconv"></chapter-ref>.)
4. The result of the <literal>-</literal> operator is the left operand minus the right
   operand.

### Shift Expressions

##### Syntax

<grammar-def>
  <rule-def id="bitshift-expression">
    <def><rule>additive-expression</rule></def>
    <def><rule>bitshift-expression</rule> <literal>&lt;&lt;</literal> <rule>additive-expression</rule></def>
    <def><rule>bitshift-expression</rule> <literal>&gt;&gt;</literal> <rule>additive-expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. Both operands must be of an integral type.

##### Semantics

1. The result of the **<<** operator is the value of the left operand
   with its bits shifted to the left by the value of the right operand.
2. The result of the **>>** operator is the value of the left operand
   with its bits shifted to the right by the value of the right operand.
3. In the case the right operand is a negative value, the operation acts as the
   inverse operation: left shift becomes right shift and vice versa.

### Relational Expressions

##### Syntax

<grammar-def>
  <rule-def id="relational-expression">
    <def><rule>bitshift-expression</rule></def>
    <def><rule>relational-expression</rule> <literal>&lt;</literal> <rule>bitshift-expression</rule></def>
    <def><rule>relational-expression</rule> <literal>&lt;=</literal> <rule>bitshift-expression</rule></def>
    <def><rule>relational-expression</rule> <literal>&gt;</literal> <rule>bitshift-expression</rule></def>
    <def><rule>relational-expression</rule> <literal>&gt;=</literal> <rule>bitshift-expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. Both operands must be of a compatible comparable type (See <chapter-ref target="comp-Semantics"></chapter-ref>.)

##### Semantics

1. If both operands are compatible arithmetic types, then the usual arithmetic
   conversions are applied.
2. The result of the **<** operator is a boolean true value if the left
   operand's value is less than the right operand's value.
3. The result of the **<=** operator is analogous to the result of the
   **<** operator, except that it also returns a boolean true value when
   the left operand's value is equal to the right operand's value.
4. The result of the **>** operator is a boolean true value if the left
   operand's value is greater than the right operand's value.
5. The result of the **>=** operator is analogous to the result of the
   **>** operator, except that it also returns a boolean true value when
   the left operand's value is equal to the right operand's value.

### Equality Expressions

##### Syntax

<grammar-def>
  <rule-def id="equality-expression">
    <def><rule>relational-expression</rule></def>
    <def><rule>equality-expression</rule> <literal>==</literal> <rule>relational-expression</rule></def>
    <def><rule>equality-expression</rule> <literal>!=</literal> <rule>relational-expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. Both operands must be of a compatible type.

##### Semantics

1. If both operands are compatible arithmetic types, then the usual arithmetic
   conversions are applied.
2. The result of the **==** operator is a boolean true value if the left
   operand's value is equal to the right operand's value.
3. The result of the **!=** operator is the inverse of the **==**
   operator's value.

### XOR Expressions

##### Syntax

<grammar-def>
  <rule-def id="xor-expression">
    <def><rule>equality-expression</rule></def>
    <def><rule>xor-expression</rule> <literal>^</literal> <rule>equality-expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. Both operands must be of a valid integral type

##### Semantics

1. The usual arithmetic conversions are applied.
2. The result of the **`^`** operator is the value of the left
   operand with every bit set to true if and only if the corresponding bit is
   set in only one of the operands.

### Bitwise AND Expressions

##### Syntax

<grammar-def>
  <rule-def id="bitwise-and-expression">
    <def><rule>xor-expression</rule></def>
    <def><rule>bitwise-and-expression</rule> <literal>&</literal> <rule>xor-expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. Both operands must be of a valid integral type

##### Semantics

1. The usual arithmetic conversions are applied.
2. The result of the **`&`** operator is the value of the left
   operand with every bit set to true if the corresponding bit in the right
   operand is also set to true.

### Bitwise OR Expressions

##### Syntax

<grammar-def>
  <rule-def id="bitwise-or-expression">
    <def><rule>bitwise-and-expression</rule></def>
    <def><rule>bitwise-or-expression</rule> <literal>|</literal> <rule>bitwise-and-expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. Both operands must be of a valid integral type

##### Semantics

1. The usual arithmetic conversions are applied.
2. The result of the **`|`** operator is the value of the left
   operand with every bit set to true if the bit is set in either the left
   operand or the right operand.

### Logical AND Expressions

##### Syntax

<grammar-def>
  <rule-def id="logical-and-expression">
    <def><rule>bitwise-or-expression</rule></def>
    <def><rule>logical-and-expression</rule> <literal>&&</literal> <rule>bitwise-or-expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. Both operands must be of a valid integral or boolean-assignable type.

##### Semantics

1. The usual arithmetic conversions are applied if both operands are arithmetic
   types.
2. The result of the **`&&`** operator is a boolean true value
   if both operands evaluate to a true value.
3. If the first operand evaluates to a false value, the second operator must
   not be evaluated.

### Logical OR Expressions

##### Syntax

<grammar-def>
  <rule-def id="logical-or-expression">
    <def><rule>logical-and-expression</rule></def>
    <def><rule>logical-or-expression</rule> <literal>||</literal> <rule>logical-and-expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. Both operands must be of a valid integral or boolean-assignable type.

##### Semantics

1. The usual arithmetic conversions are applied if both operands are arithmetic
   types.
2. The result of the **`||`** operator is a boolean true value
   if at least one of the operands are a boolean true value.
3. If the left operand evaluates to a true value, the right operand must not be
   evaluated.

### Conditional Expression

##### Syntax

<grammar-def>
  <rule-def id="conditional-expression">
    <def><rule>logical-or-expression</rule></def>
    <def>
      <rule>logical-or-expression</rule>
      <literal>?</literal>
      <rule>expression</rule>
      <literal>:</literal>
      <rule>conditional-expression</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. The condition expression must result in a boolean-assignable value.
2. Both the left and the right operands must result in a compatible type.

##### Semantics

1. The condition operand is evaluated first, if it results in a true value,
   the left operand is the result of the expression, otherwise the right
   operand is the result.
2. If the left operand is the result, the right operand must not be evaluated,
   and vice versa.

### Assignment Expression

##### Syntax

<grammar-def>
  <rule-def id="assignment-expression">
    <def><rule>conditional-expression</rule></def>
    <def><rule>conditional-expression</rule> <rule>assignment-operator</rule> <rule>assignment-expression</rule></def>
  </rule-def>

  <rule-def id="assignment-operator" type="oneof">
    <def>
      <literal>= &= &&= |= *= /= += -= ^= %= <<= >>= **= ||= ??=</literal>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. The left operand must be a valid mutable lvalue.
2. Both operands must meet all Constraints, as declared in each operator's
   section.

##### Semantics

1. For non-simple assignment operations (Not <literal>=</literal>), the result
   of an assignment expression is the left operand and right operand's result
   according to the operator before the <literal>=</literal> operator. As a
   side effect, the result of this operator is written to the left operand's
   object.
2. For simple assignment operations, the result of an assignment expression is
   the right operand's value. As a side effect, the right operand's value is
   written to the left operand's object.

### Top Level Expression

##### Syntax

<grammar-def>
  <rule-def id="expression">
    <def><rule>assignment-expression</rule></def>
  </rule-def>
</grammar-def>

### Loop Condition Expression

##### Syntax

<grammar-def>
  <rule-def id="statement-condition-expression">
    <def><literal>(</literal> <rule>expression</rule> <literal>)</literal></def>
    <def><rule>expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. The operand must result in a boolean-assignable value.

##### Semantics

1. The result of the loop condition expression is a boolean true/false value.

## Type Expressions

##### Syntax

<grammar-def>
  <rule-def id="type-expression">
    <def><rule>array-type-expression</rule></def>
  </rule-def>
</grammar-def>

### Type Name Expressions

##### Syntax

<grammar-def>
  <rule-def id="type-name-expression">
    <def><rule>type-keyword</rule></def>
    <def><rule>identifier</rule></def>
    <def>
      <rule>module-name</rule>
      <literal>::</literal>
      <rule>identifier</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. The referenced type must be accessible in the current scope.

##### Semantics

1. References a declared/imported type.
2. The order of type declarations must be irrelevant to when its referenced.

### Type Parameter Instantiation Expressions

##### Syntax

<grammar-def>
  <rule-def id="parameterized-type-expression">
    <def><rule>type-name-expression</rule></def>
    <def><rule>type-name-expression</rule> <rule>type-parameter-instatiation</rule></def>
  </rule-def>

  <rule-def id="type-parameter-instatiation">
    <literal>&lt;</literal> <rule>type-expression-list</rule> <literal>&gt;</literal>
  </rule-def>

  <rule-def id="type-expression-list">
    <def><rule>type-expression</rule></def>
    <def><rule>type-expression-list</rule> <literal>,</literal> <rule>type-expression</rule></def>
  </rule-def>
</grammar-def>

##### Constraints

1. The type being referenced must support type parameters and have declared type parameters.
2. Each type parameter must match the one on the declared type.

##### Semantics

1. Fills out a referenced type's type parameters.

### Nullable Type Expressions

##### Syntax

<grammar-def>
  <rule-def id="nullable-type-expression">
    <def><rule>parameterized-type-expression</rule></def>
    <def><rule>parameterized-type-expression</rule> <literal>?</literal></def>
  </rule-def>
</grammar-def>

##### Semantics

1. Declares a type to be nullable.
2. Variables, properties, fields or function arguments marked as nullable may
   be set as <literal>null</literal>.

### Array Type Expressions

##### Syntax

<grammar-def>
  <rule-def id="array-type-expression">
    <def><rule>nullable-type-expression</rule></def>
    <def><rule>array-type-expression</rule> <literal>[]</literal></def>
    <def><rule>array-type-expression</rule> <literal>readonly</literal> <literal>[]</literal></def>
  </rule-def>
</grammar-def>

##### Semantics

1. References an array of a specific type.
2. Declaring a <literal>readonly</literal> array prohibits all modification of
   the array's elements.

## Declarations

##### Syntax

<grammar-def>
  <rule-def id="declaration">
    <def><rule>function-declaration</rule></def>
    <def><rule>extension-function-declaration</rule></def>
    <def><rule>variable-declaration</rule></def>
    <def><rule>struct-declaration</rule></def>
    <def><rule>enum-declaration</rule></def>
    <def><rule>variant-type-declaration</rule></def>
    <def><rule>interface-declaration</rule></def>
    <def><rule>class-declaration</rule></def>
  </rule-def>

  <rule-def id="module-header-declarations">
    <def><rule>module-declaration</rule> <rule modifiers="rep">import-declaration</rule></def>
    <def><rule>module-declaration</rule></def>
    <def><rule modifiers="rep">import-declaration</rule></def>
  </rule-def>

  <rule-def id="module-name">
    <def><rule>identifier</rule></def>
    <def><rule>module-name</rule> <literal>::</literal> <rule>identifier</rule></def>
  </rule-def>
</grammar-def>

### Declaration Modifiers

##### Syntax

<grammar-def>
  <rule-def id="declaration-modifiers">
    <def>
      <rule modifiers="rep">declaration-modifier</rule>
    </def>
  </rule-def>

  <rule-def id="declaration-modifier" type="oneof">
    <def><literal>native export const</literal></def>
  </rule-def>
</grammar-def>

##### Constraints

1. No declaration modifier may be set more than once.

### Type Parameter Lists

##### Syntax

<grammar-def>
  <rule-def id="type-arguments">
    <def>
      <literal>&lt;</literal>
      <rule>type-parameter-list</rule>
      <literal>&gt;</literal>
    </def>
  </rule-def>

  <rule-def id="type-parameter-list">
    <def><rule>type-parameter</rule></def>
    <def><rule>type-parameter-list</rule> <literal>,</literal> <rule>type-parameter</rule></def>
  </rule-def>

  <rule-def id="type-parameter">
    <def><rule>identifier</rule></def>
    <def>
      <literal>class</literal>
      <rule>identifier</rule>
    </def>
    <def>
      <literal>class</literal>
      <rule>identifier</rule>
      <literal>extends</literal>
      <rule>type-expression</rule>
    </def>
    <def>
      <literal>value</literal>
      <rule>identifier</rule>
    </def>
    <def>
      <literal>enum</literal>
      <rule>identifier</rule>
    </def>
  </rule-def>
</grammar-def>

### Module Declarations

##### Syntax

<grammar-def>
  <rule-def id="module-declaration">
    <def><rule>regular-module-declaration</rule></def>
    <def><rule>native-module-declaration</rule></def>
  </rule-def>

  <rule-def id="regular-module-declaration">
    <def>
      <literal>module</literal>
      <rule>module-name</rule>
    </def>
  </rule-def>

  <rule-def id="native-module-declaration">
    <def>
      <literal>native</literal>
      <literal>module</literal>
      <rule>module-name</rule>
      <literal>from</literal>
      <rule>line-string-literal</rule>
    </def>
  </rule-def>
</grammar-def>

##### Concepts

<dl>
  <dt>Module name</dt>
  <dd>
    The name of the module itself declared after the <b><code>module</code></b>
    keyword.
  </dd>
  <dt>Native Library Name</dt>
  <dd>
    The string literal declared after the <b><code>from</code></b> keyword in a
    native module declaration. It is a file name for the dynamically-loadable
    native C/C++ library that any native functions declared in the file will be
    linked to. The string must not include the file extension.
    (eg: <code>.dll</code>)
  </dd>
</dl>

##### Constraints

1. The file name/path referenced by the native library path, if present, must
   be a valid path to a dynamically linkable library. The path must be
   accessible to the compiler and known at compile time.
2. It is not required for a module declaration to declare a name unique to the
   file it's declared in. Multiple files may share the same namespace.

##### Semantics

1. A module declaration is used by import statements to know from which file
   to import certain symbols.
2. Adding a module declaration is fully optional.
3. Omitting the module declaration means the file will be able to export any
   symbols.

### Import Declarations

##### Syntax

<grammar-def>
  <rule-def id="import-declaration">
    <def>
      <literal>import</literal>
      <rule>module-name</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. The import statement must result in at least one symbol being included in
   the source file. If no symbols are found with the namespace specified in
   the import, then the import is considered a failure.

##### Semantics

1. Import all export symbols with the specified module name namespace into
   the source file.
2. All IR, or source files, the compiler is able to find that share the
   specified namespace are imported into the current source file.
3. When an IR file, or valid source file is found that is declared as native,
   the native module need not be loaded.
4. During importing, any currently existing native bindings should also be
   checked for import. This is because native bindings can be registered
   without a pre-existing Tetral IR or source file to represent the
   declarations.

### Function Declarations

##### Syntax

<grammar-def>
  <rule-def id="function-declaration">
    <def>
      <rule modifiers="opt">declaration-modifiers</rule>
      <rule>type-expression</rule>
      <rule>identifier</rule>
      <rule>function-definition</rule>
    </def>
  </rule-def>

  <rule-def id="function-argument-list">
    <def><rule>function-argument-declaration</rule></def>
    <def>
      <rule>function-argument-list</rule>
      <literal>,</literal>
      <rule>function-argument-declaration</rule>
    </def>
  </rule-def>

  <rule-def id="function-argument-declaration">
    <def>
      <rule>type-expression</rule>
      <rule>identifier</rule>
      <literal>...</literal>
    </def>
    <def>
      <rule>type-expression</rule>
      <rule>identifier</rule>
    </def>
  </rule-def>

  <rule-def id="function-definition">
    <def>
      <rule modifiers="opt">type-arguments</rule>
      <literal>(</literal>
      <rule modifiers="opt">function-argument-list</rule>
      <literal>)</literal>
      <rule modifiers="opt">block-statement</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. The name and parameter types must not match a function that already exists
   in the current scope.
2. Function argument lists can only ever have one variadic argument: the last
   one. Multiple variadic arguments or a variadic argument not being the last
   one are invalid.
3. Functions declared with the **`export`** keyword can only be
   declared in the global scope.
4. Functions declared with the **`native`** keyword must not have
   a function body.

##### Description

Declares a function that will be accessible in the current scope.

### Extension Function Declarations

##### Syntax

<grammar-def>
  <rule-def id="extension-function-declaration">
    <def>
      <rule modifiers="opt">declaration-modifiers</rule>
      <rule>type-expression</rule>
      <rule>extension-function-name</rule>
      <rule>function-definition</rule>
    </def>
  </rule-def>
  <rule-def id="extension-function-name">
    <def>
      <rule>type-expression</rule>
      <literal>.</literal>
      <rule>identifier</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. The type referenced in the <rule>extension-function-name</rule> must be a
   valid type.
2. The function may not access any private variables declared in the extended
   type if it is a class type.

##### Semantics


### Variable Declarations

##### Syntax

<grammar-def>
  <rule-def id="variable-declaration">
    <def>
      <rule>declaration-modifiers</rule>
      <rule>type-expression</rule>
      <rule>identifier</rule>
    </def>
    <def>
      <rule>declaration-modifiers</rule>
      <rule>type-expression</rule>
      <rule>identifier</rule>
      <literal>=</literal>
      <rule>expression</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. Must not have the name of an already accessible variable in the current
   scope.
2. If a value is specified for the declaration, the variable's resulting
   value must match the declared type, or be easily convertible to the
   variable's type.
3. If the variable is declared with <literal>const</literal>, then a value
   must be specified.
4. Variable declared with the <literal>const</literal> modifier may not be
   modified at a later time.
5. Variables declared with the <literal>export</literal> keyword must only be
   declared in the global scope.
6. Variables cannot be declared with the following keywords:
   - <literal>native</literal>
7. If an initializer value is present, the initializer cannot reference the
   declared variable.
8. If the variable's type cannot be default-initialized, then a value must be
   explicitly specified. (See <chapter-ref target="def-init"></chapter-ref>)

##### Semantics

1. Declares a variable or a constant that will be accessible in the current
   scope.
2. If an initializer value is present, it becomes the value of the variable.
3. Variables declared with the <literal>export</literal> keyword are made
   available for access outside the declaring file.

### Struct Declarations

##### Syntax

<grammar-def>
  <rule-def id="struct-declaration">
    <def>
      <rule>declaration-modifiers</rule>
      <literal>struct</literal>
      <rule>identifier</rule>
      <literal>{</literal>
      <rule modifiers="opt rep">property-declaration</rule>
      <literal>}</literal>
    </def>
  </rule-def>
  <rule-def id="property-declaration">
    <def>
      <rule>type-expression</rule>
      <rule>identifier</rule>
    </def>
    <def>
      <rule>type-expression</rule>
      <rule>identifier</rule>
      <literal>=</literal>
      <rule>expression</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. A struct must not be declared with the <literal>native</literal> modifier.
2. Struct's must only be declared in the main scope of a source file.
3. Each struct property must have a unique name.
4. Each struct property, if a default value is set, must have an expression
   whose type is assignable to the property's type.
5. Struct properties may not directly or indirectly reference the declared
   struct type unless through a nullable value.

##### Semantics

1. Declares a struct data type and its properties.

### Enum Declarations

##### Syntax

<grammar-def>
  <rule-def id="enum-declaration">
    <def>
      <rule>declaration-modifiers</rule>
      <literal>enum</literal>
      <rule>identifier</rule>
      <literal>{</literal>
      <rule>enum-constant-declaration-list</rule>
      <literal>}</literal>
    </def>
  </rule-def>

  <rule-def id="enum-constant-declaration-list">
    <def><rule>enum-constant-declaration</rule></def>
    <def>
      <rule>enum-constant-declaration-list</rule>
      <literal>,</literal>
      <rule>enum-constant-declaration</rule>
    </def>
    <def>
      <rule>enum-constant-declaration-list</rule>
      <literal>,</literal>
    </def>
  </rule-def>

  <rule-def id="enum-constant-declaration">
    <def>
      <rule>identifier</rule>
    </def>
    <def>
      <rule>identifier</rule>
      <literal>=</literal>
      <rule>expression</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. An enum type must not be declared with the same name as an existing type in
   the same namespace.
2. Each enum constant declaration must have a unique name.
3. Any enum constant declared with a value expression must be an expression
   which only contains integer constant operands.

##### Semantics

1. An enum declaration declares an enumeration data type.
2. The ordinal value of each declared enum constant is either the value of the
   previous declared constant plus 1, if the constant has no specified value.
   Otherwise, if the constant has a specified value, its value becomes the
   result of its expression.

### Variant Declarations

##### Syntax

<grammar-def>
  <rule-def id="variant-type-declaration">
    <def>
      <rule>declaration-modifiers</rule>
      <rule>variant-prefix</rule>
      <literal>{</literal>
      <rule>variant-declaration-list</rule>
      <literal>}</literal>
    </def>
  </rule-def>
  <rule-def id="variant-prefix">
    <def>
      <literal>variant</literal>
      <rule>identifier</rule>
      <rule modifiers="opt">type-arguments</rule>
    </def>
  </rule-def>
  <rule-def id="variant-declaration-list">
    <def><rule>variant-declaration</rule></def>
    <def>
      <rule>variant-declaration-list</rule>
      <literal>,</literal>
      <rule>variant-declaration</rule>
    </def>
    <def>
      <rule>variant-declaration-list</rule>
      <literal>,</literal>
    </def>
  </rule-def>
  <rule-def id="variant-declaration">
    <def><rule>identifier</rule></def>
    <def>
      <rule>identifier</rule>
      <literal>(</literal>
      <rule modifiers="opt">function-argument-list</rule>
      <literal>)</literal>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. A Variant may not be declared with the same name as an existing declaration
   in the same namespace.
2. Each declared variant of a variant type declaration must have a unique name.

##### Semantics

1. Declares a variant type with the specified name and variants.
2. Declares each variant's properties.

### Interface Declarations

##### Syntax

<grammar-def>
  <rule-def id="interface-declaration">
    <def>
      <rule>declaration-modifiers</rule>
      <rule>interface-prefix</rule>
      <literal>{</literal>
      <rule modifiers="rep opt">interface-method-declaration</rule>
      <literal>}</literal>
    </def>
  </rule-def>

  <rule-def id="interface-prefix">
    <def>
      <literal>interface</literal>
      <rule>identifier</rule>
      <rule modifiers="opt">type-arguments</rule>
      <rule modifiers="opt">interface-extensions-declaration</rule>
    </def>
  </rule-def>

  <rule-def id="interface-extensions-declaration">
    <def>
      <literal>extends</literal>
      <rule>type-name-list</rule>
    </def>
  </rule-def>

  <rule-def id="type-name-list">
    <def>
      <rule>type-name-expression</rule>
    </def>
    <def>
      <rule>type-name-list</rule>
      <literal>,</literal>
      <rule>type-name-expression</rule>
    </def>
  </rule-def>

  <rule-def id="interface-method-declaration">
    <def>
      <rule>type-expression</rule>
      <rule>identifier</rule>
      <rule>function-definition</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. Interfaces can only be declared in a source file's global scope.

##### Semantics

### Class Declarations

##### Syntax

<grammar-def>
  <rule-def id="class-declaration">
    <def>
      <rule>declaration-modifiers</rule>
      <rule>class-prefix</rule>
      <literal>{</literal>
      <rule modifiers="rep opt">class-property-declaration</rule>
      <literal>}</literal>
    </def>
  </rule-def>

  <rule-def id="class-prefix">
    <def>
      <literal>class</literal>
      <rule>identifier</rule>
      <rule modifiers="opt">type-arguments</rule>
      <rule modifiers="opt">class-extension-declaration</rule>
      <rule modifiers="opt">class-implements-declaration</rule>
    </def>
  </rule-def>

  <rule-def id="class-extension-declaration">
    <def>
      <literal>extends</literal>
      <rule>type-name-expression</rule>
    </def>
  </rule-def>

  <rule-def id="class-implements-declaration">
    <def>
      <literal>implements</literal>
      <rule>type-name-list</rule>
    </def>
  </rule-def>

  <rule-def id="class-property-modifiers">
    <def>
      <rule modifiers="rep opt">class-property-modifier</rule>
    </def>
  </rule-def>

  <rule-def id="class-property-modifier" type="oneof">
    <oneof>
      <literal>public</literal>
      <literal>private</literal>
      <literal>protected</literal>
      <literal>static</literal>
      <literal>override</literal>
      <literal>const</literal>
    </oneof>
  </rule-def>

  <rule-def id="class-property-declaration">
    <def><rule>class-field-declaration</rule></def>
    <def><rule>class-method-declaration</rule></def>
    <def><rule>class-constructor-declaration</rule></def>
  </rule-def>

  <rule-def id="class-property-prefix">
    <def>
      <rule>class-property-modifiers</rule>
      <rule>type-expression</rule>
      <rule>identifier</rule>
    </def>
  </rule-def>

  <rule-def id="class-field-declaration">
    <def>
      <rule>class-property-prefix</rule>
    </def>
    <def>
      <rule>class-property-prefix</rule>
      <literal>=</literal>
      <rule>expression</rule>
    </def>
  </rule-def>

  <rule-def id="class-method-declaration">
    <def>
      <rule>class-property-prefix</rule>
      <rule>function-definition</rule>
    </def>
  </rule-def>

  <rule-def id="class-constructor-declaration">
    <def>
      <rule>class-property-modifiers</rule>
      <literal>constructor</literal>
      <literal>(</literal>
      <rule modifiers="opt">function-argument-list</rule>
      <literal>)</literal>
      <rule>block-statement</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. Classes may only be declared in a file's global scope.
2. Classes must not be declared with the same name as an already existing
   function, struct, enum, interface or global variable.
3. Classes implementing interfaces must declare a valid method
   implementation for every function outlined by its interfaces.
4. Classes may not implement 2 or more interfaces with methods whose
   implementation would cause other Constraints to be violated.
5. Classes may not extend themselves, directly or indirectly.
6. Classes may not extend a class that has not been marked with the
   <literal>extendable</literal> keyword.
7. Classes may only extend other valid classes.
8. Classes may only implement valid interfaces.
9. Classes may not extend classes if the extension would cause an inheritence
   cycle.

##### Semantics

1. The same padding and alignment Semantics apply to classes as do to structs.

#### Class Fields

##### Constraints

1. Classes may not have 2 or more fields with the same name.
2. Fields declared with the **`const`** modifier must either
   have a value specified by default or be initialized in the constructor.
3. If a field has a default value, its value must be a valid expression that
   results in a type compatible with the field's type.

##### Semantics

1. Declares an accessible property.

#### Class Constructors

##### Constraints

1. Classes may not have 2 or more constructors with the same function
   signature.
2. Constructors may not be declared with the **`override`** or
   **`static`** keyword.
3. Constructors may not return a value.
4. All Constraints that apply to regular function argument lists also apply to
   constructor arguments.
5. If a class is declared with a base type that requires explicit
   initialization, then each constructor declared in a class must
   initialize the base type with a <rule>super-constructor-expression</rule>.

##### Semantics

1.

#### Class Methods

##### Constraints

1. The declared return type must be a valid type.
2. The same Constraints that apply to regular function declarations also apply
   to method declarations, except for those which cannot be applied to method
   declarations.
3. Classes may only declare functions with the same name if the argument
   signatures differs.
4. Classes may not override any methods declared in an inherited type that have
   the <literal>const</literal> keyword.
5. Classes may not override any methods declared in an inherited type that have
   the **`const`** keyword.
6. Classes overriding methods from an inherited class or interface must use the
   **`override`** modifier.
7. A method declared with the <literal>static</literal> modifier cannot also
   use the modifier <literal>override</literal>.

##### Semantics

1. Declares a member function that belongs to the class the method was
   declared in.

#### Class Access Modifiers

##### Constraints

1. Each modifier is mutually exclusive to another access modifier.

##### Semantics

1. Access modifiers modify how fields and methods may be accessed from outside
   the class the symbol was declared in.
2. The <literal>private</literal> keyword ensures a class symbol is only
   accessible in the class it was declared in.
3. The <literal>protected</literal> keyword ensures a class symbol is only
   accessible in the class it was declared in, or in a class extending the
   class.
4. The <literal>public</literal> modifier allows a class symbol to be accessed
   from anywhere.
5. Omitting the access modifier is equivalent to using the
   <literal>public</literal> access modifier.

## Statements

##### Syntax

<grammar-def>
  <rule-def id="statement">
    <def><rule>labeled-statement</rule></def>
    <def><rule>declaration</rule></def>
    <def><rule>body-statement</rule></def>
  </rule-def>
  <rule-def id="body-statement">
    <def><rule>block-statement</rule></def>
    <def><rule>for-loop-statement</rule></def>
    <def><rule>for-each-loop-statement</rule></def>
    <def><rule>do-while-statement</rule></def>
    <def><rule>while-statement</rule></def>
    <def><rule>switch-statement</rule></def>
    <def><rule>if-statement</rule></def>
    <def><rule>return-statement</rule></def>
    <def><rule>control-flow-statement</rule></def>
    <def><rule>assert-statement</rule></def>
    <def>
      <rule>expression</rule>
    </def>
  </rule-def>
</grammar-def>

### Block Statements

##### Syntax

<grammar-def>
  <rule-def id="block-statement">
    <def>
      <literal>{</literal>
      <rule modifiers="opt rep">statement</rule>
      <literal>}</literal>
    </def>
  </rule-def>
</grammar-def>

##### Description

Declares a list of statements delimited by **`{`** and
**`}`** characters.

Variables declared inside of block statements cannot be referenced from
outside of that block.

### Loop Flow Control Statements

##### Syntax

<grammar-def>
  <rule-def id="control-flow-statement">
    <def>
      <literal>continue</literal>
      <rule modifiers="opt">identifier</rule>
    </def>
    <def>
      <literal>break</literal>
      <rule modifiers="opt">identifier</rule>
    </def>
  </rule-def>
</grammar-def>

##### Description

Influences the way a loop executes. Continue statements instruct the loop to
move on to the next iteration of execution, while break statements cause
the loop to be exited early before its condition can evaluate to a false
value.

Control Flow statements can be declared with a label. This label is optional,
if no label is specified, the statement changes how the immediate loop
behaves. If a label is set, then it controls how the referenced loop behaves.

##### Constraints

1. Can only be used inside a loop
2. If a label is specified, the label can only reference a label of a loop
   the statement is inside.

### If Statements

##### Syntax

<grammar-def>
  <rule-def id="if-statement">
    <def>
      <literal>if</literal>
      <rule>statement-condition-expression</rule>
      <rule>body-statement</rule>
    </def>
    <def>
      <literal>if</literal>
      <rule>statement-condition-expression</rule>
      <rule>body-statement</rule>
      <literal>else</literal>
      <rule>body-statement</rule>
    </def>
  </rule-def>
</grammar-def>

##### Description

Evaluates a condition and executes either a body, an else statement or moves
on without executing.

##### Constraints

1. The if statement's condition must result in a value that can be assigned to
   a true/false value.

### Labeled Statements

##### Syntax

<grammar-def>
  <rule-def id="labeled-statement">
    <def><rule>identifier</rule> <literal>:</literal> <rule>for-loop-statement</rule></def>
    <def><rule>identifier</rule> <literal>:</literal> <rule>for-each-loop-statement</rule></def>
    <def><rule>identifier</rule> <literal>:</literal> <rule>do-while-statement</rule></def>
    <def><rule>identifier</rule> <literal>:</literal> <rule>while-statement</rule></def>
    <def><rule>identifier</rule> <literal>:</literal> <rule>switch-statement</rule></def>
  </rule-def>
</grammar-def>

### Switch Statements

##### Syntax

#### Switch Expression

<grammar-def>
  <rule-def id="switch-statement">
    <def>
      <literal>switch</literal>
      <rule>statement-condition-expression</rule>
      <literal>{</literal>
      <literal>}</literal>
    </def>
  </rule-def>

  <rule-def id="simple-case-list">
    <def><rule>simple-switch-case</rule></def>
    <def>
      <rule>simple-case-list</rule>
      <rule>simple-switch-case</rule>
    </def>
  </rule-def>
  <rule-def id="block-case-list">
    <def><rule>block-switch-case</rule></def>
    <def>
      <rule>block-case-list</rule>
      <rule>block-switch-case</rule>
    </def>
  </rule-def>

  <rule-def id="simple-switch-case-prefix">
    <def><literal>default</literal></def>
    <def>
      <literal>case</literal>
      <rule>expression</rule>
    </def>
  </rule-def>

  <rule-def id="simple-switch-case">
    <def>
      <rule>simple-switch-case-prefix</rule>
      <literal>:</literal>
      <rule modifiers="opt rep">statement</rule> <sub>except <literal>case</literal> or <literal>default</literal></sub>
    </def>
  </rule-def>

  <rule-def id="comma-delimited-expression">
    <def><rule>expression</rule></def>
    <def><rule>comma-delimited-expression</rule> <literal>,</literal> <rule>expression</rule></def>
  </rule-def>

  <rule-def id="block-case-prefix">
    <def><literal>default</literal></def>
    <def>
      <literal>case</literal>
      <rule>comma-delimited-expression</rule>
    </def>
  </rule-def>

  <rule-def id="block-switch-case">
    <def>
      <rule>switch-case-prefix</rule>
      <literal>=></literal>
      <rule>expression</rule>
    </def>
    <def>
      <rule>switch-case-prefix</rule>
      <literal>=></literal>
      <rule>block-statement</rule>
    </def>
  </rule-def>
</grammar-def>

### For Loop Statements

##### Syntax

<grammar-def>
  <rule-def id="for-loop-statement">
    <def>
      <literal>for</literal>
      <literal>(</literal>
      <rule modifiers="opt">variable-declaration</rule>
      <literal>;</literal>
      <rule modifiers="opt">expression</rule>
      <literal>;</literal>
      <rule modifiers="opt">expression</rule>
      <literal>)</literal>
      <rule>body-statement</rule>
    </def>
  </rule-def>
</grammar-def>

##### Terminology

A for loop has three operands, the first, second and third operand. The first,
if present, declares a variable, the second evaluates a condition, and a third
expression performs some operation to move the for-loop forward.

##### Constraints

1. The second operand, if present, must result in a boolean-assignable value.

##### Semantics

### For-Each Loop Statement

##### Syntax

<grammar-def>
  <rule-def id="foreach-loop-statement">
    <def>
      <literal>for</literal>
      <literal>(</literal>
      <rule>type-expression</rule>
      <rule>identifier</rule>
      <literal>:</literal>
      <rule>expression</rule>
      <literal>)</literal>
      <rule>body-statement</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. The right operand, after the <rule>identifier</rule>, must result in an
   array or a string.
2. The variable declaration must be of the type that the right operand
   contains.

##### Semantics

1. Iterates over each element of the right operand and performs some operation.
2. The element being iterated over is the one declared in the
   <rule>identifier</rule> and must be available as a variable.

### Do While Loop Statements

##### Syntax

<grammar-def>
  <rule-def id="do-while-statement">
    <def>
      <literal>do</literal>
      <rule>block-statement</rule>
      <literal>while</literal>
      <rule>statement-condition-expression</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. The loop's condition must result in a value that can be evaluated as a boolean.

##### Description

Evaluates a block of code until the defined loop condition results in a false
value. The loop's block will be evaluated at least once until the condition
is reached.

### Regular While Loop Statements

##### Syntax

<grammar-def>
  <rule-def id="while-statement">
    <def>
      <literal>while</literal>
      <rule>statement-condition-expression</rule>
      <rule>block-statement</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. The loop's condition must result in a value that can be evaluated as a boolean.

##### Description

Evaluates a block of code until the defined loop condition results in a false
value. If the condition results in a false value when the loop is first
reached, the loop's block is not evaluated at all.

### Return Statements

##### Syntax

<grammar-def>
  <rule-def id="return-statement">
    <def>
      <literal>return</literal>
      <rule modifiers="opt">expression</rule>
    </def>
  </rule-def>
</grammar-def>

##### Description

Causes the current function to halt execution and return to the caller.

##### Constraints

1. Can only be used inside a function body.
2. If the return statement is used in a non-void function, it must always
   return a value.
3. If the return statement is used in a void function, it must never return
   a value.
4. The value returned by a return statement, must be assignable to the
   function's return type.

### Yield Statements

##### Syntax

<grammar-def>
  <rule-def id="yield-statement">
    <def>
      <literal>yield</literal>
      <rule>expression</rule>
    </def>
  </rule-def>
</grammar-def>

##### Constraints

1. Can only be used inside a switch statement's case.
2. The yielded value must be a non-void value.

##### Semantics

1. Evaluate an expression and return, or *yield*, it as the result of a
   switch statement's case.

### Assert Statements

##### Syntax

<grammar-def>
  <rule-def id="assert-statement">
    <def>
      <literal>assert</literal>
      <rule>expression</rule></def>
    <def>
      <literal>assert</literal>
      <rule>expression</rule>
      <literal>:</literal>
      <rule>expression</rule>
    </def>
  </rule-def>
</grammar-def>

##### Semantics

1. Evaluates the condition operand. If the condition results in a true
   boolean-assignable value, nothing happens. Otherwise, an error is thrown.
2. If the message operand is present, it is evaluated and used as the error
   message for the thrown error.
3. If no message operand is present, it must be created from the values of the
   variables present in the condition expression. (See Message Generation
   section below).
4. The inclusion of the assert statement in the compiled output is optional,
   as is the execution of the assert statement

##### Constraints

1. The expression the assert statement evaluates must always result in a
   boolean-assignable value.
2. The message expression, if present, must always result in a String value.

##### Message Generation

The messages used by assert statements, if one is not explicitly provided,
should be composed of the values of each variable used in the expression,
for example, when asserting that a variable named *"foo"* is equal to
10, the automatic error message should be composed of the expression string
and followed by the variable's value. In effect, turning the statement into
this:

{{<highlight java>}}
assert foo == 10 : "foo == 10, foo: ${foo}"
{{</highlight>}}

##### Examples

{{<highlight java>}}
assert true // Does nothing
assert false // Assertion failed!
assert false : "message" // Assertion failed: message
{{</highlight>}}

## Translation Unit

<grammar-def>
  <rule-def id="translation-unit">
    <def><rule>module-header-declarations</rule> <rule modifiers="rep">declaration</rule></def>
    <def><rule modifiers="rep">declaration</rule></def>
  </rule-def>
</grammar-def>

# Intermediate Representation (Bytecode Format)

The result of the compilation of a Tetral source file should be a Tetral
Bytecode file.

Bytecode files are binary files with little-endian byte ordering.

## File Header

Each Tetral IR file must be prefixed with a file header to provide
information about the file's contents. The layout of the header shall be as
follows.

The header shall begin with an ASCII string that must always have the value
`TetralLang`. This shall be immediately followed by a 16-bit
unsigned integer denoting the file's version.

The file version integer is an incrementing integer which specifies what
version of the Tetral bytecode format the file complies with.

The following file versions are valid

<table>
  <caption>Tetral File Versions</caption>
  <thead>
  <tr>
    <th>Version number</th>
    <th>Description</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td>1</td>
    <td>The first version of the Tetral Language</td>
  </tr>
  </tbody>
</table>

The vile version integer must then followed by a repeating pattern. Each
instance of this pattern shall begin with a single unsigned byte, the entry
type. No entry may be defined twice. Each entry's presence in the file is
optional.

The following types are valid.

<table>
  <caption>Bytecode Header Entry Types</caption>
  <thead>
  <tr>
    <th>Name</th>
    <th>Hexadecimal Value</th>
    <th>Description</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td><code>END</code></td>
    <td><code>0x00</code></td>
    <td>Special entry type that shall mark the end of the header.</td>
  </tr>
  <tr>
    <td><code>STRTABLE</code></td>
    <td><code>0x01</code></td>
    <td>String table information</td>
  </tr>
  <tr>
    <td><code>STRDATA</code></td>
    <td><code>0x02</code></td>
    <td>String pool information</td>
  </tr>
  <tr>
    <td><code>TYPETABLE</code></td>
    <td><code>0x03</code></td>
    <td>Type table information</td>
  </tr>
  <tr>
    <td><code>FUNCTABLE</code></td>
    <td><code>0x04</code></td>
    <td>Function table information</td>
  </tr>
  <tr>
    <td><code>INSTRBLOCK</code></td>
    <td><code>0x05</code></td>
    <td>Instruction block information</td>
  </tr>
  <tr>
    <td><code>RDATA</code></td>
    <td><code>0x06</code></td>
    <td>Read only data block information</td>
  </tr>
  <tr>
    <td><code>MDATA</code></td>
    <td><code>0x06</code></td>
    <td>Pre-defined metadata properties</td>
  </tr>
  <tr>
    <td><code>ADATA</code></td>
    <td><code>0x06</code></td>
    <td>List of arbitrary key,value string pairs.</td>
  </tr>
  <tr>
    <td><code>MODINFO</code></td>
    <td><code>0x07</code></td>
    <td>Information about the import and export list.</td>
  </tr>
  </tbody>
</table>

### The `STRTABLE` Entry

This entry shall be comprised of a 64-bit unsigned integer: an offset of the
string table's data from the start of the file, and a 32-bit unsigned integer:
the number of entries in the string table.

(See <chapter-ref target="ir-strtable"></chapter-ref>)

### The `STRDATA` Entry

This entry shall be comprised of two 64-bit unsigned integers, the first is
an offset and the second is a size. The offset specifies where, from the start
of the file, the file's string pool data is located and the size specifies
the size (in bytes) of the file's string pool data.

(See <chapter-ref target="ir-strdata"></chapter-ref>)

### The `TYPETABLE` Entry

This entry shall be comprised of a 64-bit unsigned integer: an offset of the
type table's data from the start of the file, and a 32-bit unsigned integer:
the number of entries in the type table.

(See <chapter-ref target="ir-typetable"></chapter-ref>)

### The `FUNCTABLE` Entry

This entry shall be comprised of a 64-bit unsigned integer: an offset of the
function table's data from the start of the file, and a 32-bit unsigned
integer: the number of entries in the function table.

(See <chapter-ref target="ir-ftable"></chapter-ref>)

### The `INSTRBLOCK` Entry

This entry shall be comprised of the following pieces of data. The values
shall appear in the binary in the order they are defined here.

<dl>
  <dt>Instruction block offset</dt>
  <dd>
    A 64-bit unsigned integer that must specify the file's instruction block
    offset from the start of the file.
  </dd>
  <dt>Instruction block size</dt>
  <dd>
    A 32-bit unsigned integer that must specify the file's instruction block
    size in bytes.
  </dd>
  <dt>Instruction count</dt>
  <dd>
    A 32-bit unsigned integer that must specify how many instructions are in the
    instruction block.
  </dd>
</dl>

(See <chapter-ref target="ir-instr"></chapter-ref>)

### The `RDATA` Entry

This entry shall be comprised of two 64-bit unsigned integers, they are as
follows and appear in the order they are listed.

1. The offset of the data block from the start of the file.
2. The size of the data block, in bytes.

(See <chapter-ref target="ir-dblock"></chapter-ref>)

### The `MDATA` Entry

This entry shall be comprised of the following values which and appear in the
order they are listed.

<dl>
  <dt>The file's global scope size</dt>
  <dd>
    A 64-bit unsigned integer that shall determine how many bytes are required
    to represent the variables stored in the file's global scope.
  </dd>
  <dt>Entrypoint function index</dt>
  <dd>
    <p>
      An 32-bit unsigned integer index that shall reference an entry in the
      function table. This referenced function shall be where execution of this
      file shall begin.
    </p>
    <p>
      A value (in hexadecimal) of <code>0xFFFFFFFF</code> shall mean that the
      file has no entrypoint and cannot be executed by itself.
    </p>
  </dd>
</dl>

### The `ADATA` Entry

This entry shall begin with a 32-bit unsigned integer that denotes the number
of key value pairs stored in the section.

It shall then be followed by a number of key-value pairs of strings. The number
of these pairs shall be determined by the prefixing 32-bit unsigned integer.
Each string must be prefixed with a 16-bit unsigned integer denoting the
length of the string and must then be followed by that many bytes of UTF-8
code units.

<h3 id="ir-strtable">String Pool Table</h3>

To be referred to as the *String Pool Table*, or just the *String
Table*, shall be a list of 32-bit unsigned integer pairs. The number of
entries in the table is determined in the `STRTABLE` entry in the
file header.

Each 32-bit unsigned integer in each pair is defined as follows:

<dl>
  <dt>String Pool Offset</dt>
  <dd>
    The first 32-bit unsigned integer must be an address of a string's content
    in the String Pool Data.
  </dd>
  <dt>String Length</dt>
  <dd>
    The second integer must be the number of UTF-8 code units in the string.
  </dd>
</dl>

The first entry in the list may be a *"null"* string entry, meaning an
entry with offset 0 and length 0, used as a placeholder for an empty, or null,
string.

If this section is present in a bytecode file, then the String Pool Data
section must be present too, as well as the corresponding entries in the
header.

<h3 id="ir-strdata">String Pool Data</h3>

This section shall be a block of UTF-8 code units. The size and location of
this section shall determined by the `STRPOOL` entry in the file's
header.

If this section is present in a bytecode file, then the String Pool Table
section must be present too, as well as the corresponding entries in the
header.

<h3 id="ir-typetable">Type Table</h3>

This section shall be a list of type definitions. The number of definitions
in this section and the section's location in the file shall be determined by
the `TYPETABLE` entry in the header.

Each definition must be prefixed with 2 values, an unsigned 32-bit integer
and an 8-bit unsigned integer.

The first integer shall be the *"type index"* of the type definition.
This index is used in function table entries, other type table entries, and in
some IR instructions to reference the type definition.

The second 8-bit unsigned integer shall mark the type of the entry. The
following values are considered valid.

<table>
  <caption>Type Table Definition Types</caption>
  <thead>
  <tr>
    <th>Name</th>
    <th>Hexadecimal Value</th>
  </tr>
  </thead>
  <tbody>
  <tr><td><code>ARRAY</code></td><td><code>0x00</code></td></tr>
  <tr><td><code>FUNCSIGN</code></td><td><code>0x01</code></td></tr>
  <tr><td><code>STRUCT</code></td><td><code>0x02</code></td></tr>
  <tr><td><code>ENUM</code></td><td><code>0x03</code></td></tr>
  <tr><td><code>INTERFACE</code></td><td><code>0x04</code></td></tr>
  <tr><td><code>CLASS</code></td><td><code>0x05</code></td></tr>
  <tr><td><code>NULLABLE</code></td><td><code>0x06</code></td></tr>
  <tr><td><code>PARAMETERIZED</code></td><td><code>0x07</code></td></tr>
  <tr><td><code>TYPEPARAMETER</code></td><td><code>0x08</code></td></tr>
  <tr><td><code>PARAMLIST</code></td><td><code>0x09</code></td></tr>
  <tr><td><code>IMPORTED</code></td><td><code>0x0A</code></td></tr>
  </tbody>
</table>

Depending on the type, one of the schemas defined in the following sections
is used for the type.

Some entries may reference a *"null type index,"* this is a type index
constant with the hexadecimal value of `0xFFFFFFFF` and means that
the type index references no type

### Array Values Inside Entries

Multiple entries in the type table may define a *list* or *array*
of which holds some kind of values. An array is a sequential list of data.
The terms *array* and *list* will be used interchangeably inside
the following sections.

All arrays inside type table entries are prefixed with a 16-bit unsigned
integer that determines the number of entries in that array or list.

### Arrays, Nullable Definitions and Reference Definitions

These are defined in one section since their schema is identical, but each
type results in a different type construct.

These entries shall define only a single 32-bit unsigned integer value. It is
the type index of the type they reference.

The referenced type index must not be a null type index.

### Function Signatures

Function signatures shall defined with the following values. The values appear
in the binary in the order they are defined here.

<dl>
  <dt>Return type index</dt>
  <dd>
    32-bit unsigned integer index into the type table, referencing the type the
    function signature uses as a return type. This may not be a null type
    index.
  </dd>
  <dt>Variadic state</dt>
  <dd>
    8-bit unsigned integer that shall have a value of either 0 or 1 used to
    determine if the function takes in a variable number of arguments.
  </dd>
  <dt>Parameter list index</dt>
  <dd>
    A 32-bit unsigned integer referencing the <code>PARAMLIST</code> entry
    that outlines the type arguments for this type. If the type has no type
    arguments, this will be a null type index.
  </dd>
  <dt>Argument types list</dt>
  <dd>
    <p>
      An array of 32-bit unsigned type indexes referencing the type of the
      corresponding function argument's type.
    </p>
    <p>
      None of these may be null type indices. If the variadic state of the
      function is set to 1, then the last parameter to appear in this list must
      reference an entry with the type <code>ARRAY</code>.
    </p>
  </dd>
</dl>

### Structs

Structs are defined with the following values. The values appear in the binary
in the order they are defined here.

<dl>
  <dt>Name index</dt>
  <dd>
    32-bit unsigned integer index referring to the entry in the file's string
    table that is used as the type's name.
  </dd>
  <dt>Namespace index</dt>
  <dd>
    32-bit unsigned integer index referring to the entry in the file's string
    table that is used as the type's namespace. If the type has no namespace,
    the referenced entry will be the table's null entry.
  </dd>
  <dt>Property list</dt>
  <dd>
    <p>
      A list of struct properties. Each entry in this list shall contain the
      following data in the order they are written here.
    </p>
    <dl>
      <dt>Property Name</dt>
      <dd>
        32-bit unsigned integer index referring to the entry in the file's
        string table that is used as the property's name.
      </dd>
      <dt>Property Type</dt>
      <dd>
        32-bit unsigned integer index referring to the type index in the file's
        type table that shall be the struct property's type.
      </dd>
    </dl>
  </dd>
</dl>

### Enums

Enumerations shall be defined with the following values. The values appear
in the binary in the order they are defined here.

<dl>
  <dt>Name index</dt>
  <dd>
    32-bit unsigned integer index referring to the entry in the file's string
    table that is used as the type's name.
  </dd>
  <dt>Namespace index</dt>
  <dd>
    32-bit unsigned integer index referring to the entry in the file's string
    table that is used as the type's namespace. If the type has no namespace,
    the referenced entry will be the table's null entry.
  </dd>
  <dt>Constant list</dt>
  <dd>
    A list of 32-bit unsigned integers. Each integer in this list shall be a
    reference to an entry in the file's string table. The ordinal value of each
    name in this list shall be its index in the list.
  </dd>
</dl>

### Interfaces

Interfaces are defined with the following values. The values appear in the
binary in the order they are defined here.

<dl>
  <dt>Name index</dt>
  <dd>
    32-bit unsigned integer index referring to the entry in the file's string
    table that is used as the type's name.
  </dd>
  <dt>Namespace index</dt>
  <dd>
    32-bit unsigned integer index referring to the entry in the file's string
    table that is used as the type's namespace. If the type has no namespace,
    the referenced entry will be the table's null entry.
  </dd>
  <dt>Type parameter list index</dt>
  <dd>
    A 32-bit unsigned integer referencing the <code>PARAMLIST</code> entry
    that outlines the type arguments for this type. If the type has no type
    arguments, this will be a null type index.
  </dd>
  <dt>Extends count</dt>
  <dd>
    A 32-bit unsigned integer that shall determine how many other interfaces an
    interface extends.
  </dd>
  <dt>Extends list</dt>
  <dd>
    <p>
      An array of 32-bit unsigned integers that shall list the extended interfaces
      of an interface. The size of this list shall be determined by the <i>Extends
      count</i> value.
    </p>
    <p>
      Each type index in this array must reference a <code>INTERFACE</code>
      type table entry, and may not be a null type index.
    </p>
  </dd>
  <dt>Method count</dt>
  <dd>
    A 32-bit unsigned integer that shall determine how many methods the
    interface declares.
  </dd>
  <dt>Method list</dt>
  <dd>
    <p>
      This value shall be an array of 32-bit unsigned integers. The number of
      entries in this list shall be determined by the <i>Method count</i> value.
    </p>
    <p>
      Each integer value in this list must be an index into the file's function
      table, referencing the function that's declared by an interface. No entry
      in this list may be a null function index.
    </p>
  </dd>
</dl>

### Classes

Classes shall be defined with the following values. The values appear in the
binary in the order they are defined here.

<dl>
  <dt>Name index</dt>
  <dd>
    32-bit unsigned integer index referring to the entry in the file's string
    table that is used as the type's name.
  </dd>
  <dt>Namespace index</dt>
  <dd>
    32-bit unsigned integer index referring to the entry in the file's string
    table that is used as the type's namespace. If the type has no namespace,
    the referenced entry will be the table's null entry.
  </dd>
  <dt>Type parameter list index</dt>
  <dd>
    A 32-bit unsigned integer referencing the <code>PARAMLIST</code> entry
    that outlines the type arguments for this type. If the type has no type
    arguments, this will be a null type index.
  </dd>
  <dt>Parent type</dt>
  <dt>Implements count</dt>
  <dt>Implements list</dt>
  <dt>Member count</dt>
  <dt>Method list</dt>
</dl>

### Parameter List Instantiation

Parameter lists define the types another type requires to be complete.

Parameter lists are defined with the following values. The values appear in
the binary in the order they are defined here.

<dl>
  <dt>Referenced type index</dt>
  <dt>Type count</dt>
  <dt>Type list</dt>
</dl>

### Imported Type

Imported types are types which are not defined in the current file, but are
instead defined in another file and must be imported. They are defined with
the following values. The values appear in the binary in the order they are
defined here.

<dl>
  <dt>Name index</dt>
  <dd>
    32-bit unsigned integer index referring to the entry in the file's string
    table that is used as the type's name.
  </dd>
  <dt>Namespace index</dt>
  <dd>
    32-bit unsigned integer index referring to the entry in the file's string
    table that is used as the type's namespace. If the type has no namespace,
    the referenced entry will be the table's null entry.
  </dd>
</dl>

<h3 id="ir-ftable">Function Table</h3>

<h3 id="ir-instr">Instructions Block</h3>

<h3 id="ir-dblock">Data Block</h3>

<h3 id="ir-imports">Import List</h3>

<h3 id="ir-exports">Export Table</h3>

# Bytecode Instructions

The Tetral Bytecode Instruction Set is a simple instruction set with
instructions that have pre-defined layouts for their arguments. Which
instructions exist, their arguments and their numerical codes are defined in
the following sections.

Many instructions operate on *registers.* A register is a virtual
container of memory. The Bytecode Instruction Set uses 32 registers, each
64-bits large.

Register 0 is reserved for the *program counter*. An index of the
current instruction being executed by the execution environment. This register
will be referred to as the *pcr*, or as the *program counter
register.*

Each instruction's numerical value is represented as a hexadecimal number
prefixed with `0x`

## General Purpose Instructions

## Stack Memory Instructions

## Global Memory Instructions

## Closure Instructions

## Heap Memory Instructions

## Function Call Instructions

## Foreign Symbol Instructions

## Conversion Instructions

## Unary Instructions

## Binary Instructions

### Integer-only Binary Instructions

### Boolean-only Binary Instructions

### Arithmetic Binary Instructions

### Comparison Instructions

### String/Array Instructions

# The Standard Library

This section defines the modules that are part of the Tetral Standard Library.
Whether any function defined in the following sections is implemented natively
or within Tetral itself is explicitly left up to implementations to decide on.

## The `std` Module

The most basic standard library functions that would be required by a
program.

<h4 tocignore>The <code>Result</code> Variant</h4>

<code class="qs">
  <keyw>variant</keyw> <id>Result</id>&lt;<id>V</id>, <id>E</id>&gt; {
  <br><ident></ident>ERROR{<id>E</id> err},
  <br><ident></ident>SUCCESS{<id>V</id> value}
  <br>}
</code>

<h4 tocignore>The <code>readln</code> Function</h4>

<code class="qs">
  <keyw>string</keyw> <id>readln</id>()
</code>

Asks for input from the standard input and blocks execution until input has
been given.

<h4 tocignore>The <code>println</code> Function</h4>

<code class="qs">
  <keyw>void</keyw> <id>println</id>(<keyw>string</keyw> message)
</code>

Prints a string to the standard output and appends a newline (U+000A)
character.

<h4 tocignore>The <code>getenv</code> Function</h4>

<code class="qs">
  <keyw>string</keyw>? <id>getenv</id>(<keyw>string</keyw> name)
</code>

The `getenv` function takes as input a single string: the
variable name and returns a value associated with that environment variable.

If no value is associated with that value, an empty nullable is returned
instead.

<h4 tocignore>The <code>setenv</code> Function</h4>

<code class="qs">
<keyw>void</keyw> <id>setenv</id>(<keyw>string</keyw> name, <keyw>string</keyw> value)
<br>
<keyw>void</keyw> <id>setenv</id>(<keyw>string</keyw> name, <keyw>string</keyw> value, <keyw>bool</keyw> overwrite)
</code>

This function is defined with two overloads. Both definitions take in a
variable name and value. One of the overloads takes in a boolean value. If
this value is false, then the envirnoment variable will not be overwritten if
it is already set.

The function changes a value in or adds to the list of environment variables.

<h4 tocignore>Numeric Parsing Functions</h4>

<code class="qs">
<keyw>int32</keyw>? <id>parseInt</id>(<keyw>string</keyw> s)
<br>
<keyw>uint32</keyw>? <id>parseUint</id>(<keyw>string</keyw> s)
<br>
<keyw>int64</keyw>? <id>parseInt64</id>(<keyw>string</keyw> s)
<br>
<keyw>uint64</keyw>? <id>parseUint64</id>(<keyw>string</keyw> s)
<br>
<keyw>float32</keyw>? <id>parseFloat</id>(<keyw>string</keyw> s)
<br>
<keyw>float64</keyw>? <id>parseFloat64</id>(<keyw>string</keyw> s)
</code>

Every one of these functions takes a string as an input and parses the
beginning of that string into a number of the equivalent value of the
respective type.

## The `std::strings` Module

<code class="qs">
<keyw>string</keyw> <id>stringFromUtf8</id>(<keyw>uint8</keyw>[] utf8bytes)
<br><keyw>string</keyw> <id>stringFromUtf16</id>(<keyw>uint16</keyw>[] utf16bytes)
<br><keyw>string</keyw> <id>stringFromUtf32</id>(<keyw>uint32</keyw>[] codepoints)
<br>
<br><keyw>string</keyw> <keyw>string</keyw>::<id>trim</id>()
<br><keyw>string</keyw> <keyw>string</keyw>::<id>trimLeft</id>()
<br><keyw>string</keyw> <keyw>string</keyw>::<id>trimRight</id>()
<br>
<br><keyw>string</keyw> <keyw>string</keyw>::<id>substring</id>(<keyw>uint32</keyw> start)
<br><keyw>string</keyw> <keyw>string</keyw>::<id>substring</id>(<keyw>uint32</keyw> start, <keyw>uint32</keyw> end)
<br>
<br><keyw>uint32</keyw>? <keyw>string</keyw>::<id>indexOf</id>(<keyw>uint8</keyw> utf8char)
<br><keyw>uint32</keyw>? <keyw>string</keyw>::<id>indexOf</id>(<keyw>uint8</keyw> utf8char, <keyw>uint32</keyw> start)
<br><keyw>uint32</keyw>? <keyw>string</keyw>::<id>indexOf</id>(<keyw>uint32</keyw> codepoint)
<br><keyw>uint32</keyw>? <keyw>string</keyw>::<id>indexOf</id>(<keyw>uint32</keyw> codepoint, <keyw>uint32</keyw> start)
<br><keyw>uint32</keyw>? <keyw>string</keyw>::<id>indexOf</id>(<keyw>string</keyw> other)
<br><keyw>uint32</keyw>? <keyw>string</keyw>::<id>indexOf</id>(<keyw>string</keyw> other, <keyw>uint32</keyw> start)
<br>
<br><keyw>uint32</keyw>? <keyw>string</keyw>::<id>lastIndexOf</id>(<keyw>uint8</keyw> utf8char)
<br><keyw>uint32</keyw>? <keyw>string</keyw>::<id>lastIndexOf</id>(<keyw>uint8</keyw> utf8char, <keyw>uint32</keyw> end)
<br><keyw>uint32</keyw>? <keyw>string</keyw>::<id>lastIndexOf</id>(<keyw>uint32</keyw> codepoint)
<br><keyw>uint32</keyw>? <keyw>string</keyw>::<id>lastIndexOf</id>(<keyw>uint32</keyw> codepoint, <keyw>uint32</keyw> end)
<br><keyw>uint32</keyw>? <keyw>string</keyw>::<id>lastIndexOf</id>(<keyw>string</keyw> other)
<br><keyw>uint32</keyw>? <keyw>string</keyw>::<id>lastIndexOf</id>(<keyw>string</keyw> other, <keyw>uint32</keyw> end)
<br>
<br><keyw>bool</keyw> <keyw>string</keyw>::<id>contains</id>(<keyw>uint8</keyw> utf8char)
<br><keyw>bool</keyw> <keyw>string</keyw>::<id>contains</id>(<keyw>uint8</keyw> utf8char, <keyw>uint32</keyw> end)
<br><keyw>bool</keyw> <keyw>string</keyw>::<id>contains</id>(<keyw>uint32</keyw> codepoint)
<br><keyw>bool</keyw> <keyw>string</keyw>::<id>contains</id>(<keyw>uint32</keyw> codepoint, <keyw>uint32</keyw> end)
<br><keyw>bool</keyw> <keyw>string</keyw>::<id>contains</id>(<keyw>string</keyw> other)
<br><keyw>bool</keyw> <keyw>string</keyw>::<id>contains</id>(<keyw>string</keyw> other, <keyw>uint32</keyw> end)
<br>
<br><keyw>bool</keyw> <keyw>string</keyw>::<id>replace</id>(<keyw>string</keyw> sequence, <keyw>string</keyw> with)
<br>
<br><keyw>bool</keyw> <keyw>string</keyw>::<id>startsWith</id>(<keyw>string</keyw> other)
<br><keyw>bool</keyw> <keyw>string</keyw>::<id>endsWith</id>(<keyw>string</keyw> other)
<br>
<br><keyw>uint32</keyw>? <keyw>string</keyw>::<id>codepointAt</id>(<keyw>uint32</keyw> index)
<br><keyw>uint32</keyw> <keyw>string</keyw>::<id>codepoints</id>()
<br>
<br><keyw>uint32</keyw>[] <keyw>string</keyw>::<id>toUtf32</id>()
<br><keyw>uint16</keyw>[] <keyw>string</keyw>::<id>toUtf16</id>()
<br><keyw>uint8</keyw>[] <keyw>string</keyw>::<id>toUtf8</id>()
<br>
<br><keyw>bool</keyw> <keyw>string</keyw>::<id>isEmpty</id>()
<br><keyw>bool</keyw> <keyw>string</keyw>::<id>isBlank</id>()
<br>
<br><keyw>string</keyw> <keyw>string</keyw>::<id>toUpperCase</id>()
<br><keyw>string</keyw> <keyw>string</keyw>::<id>toLowerCase</id>()
</code>

## The `std::math` Module

## The `std::io` Module

## The `std::reflection` Module

<h4 tocignore>The <code>DataTypeKind</code> enumeration</h4>

<code class="qs">
  <keyw>enum</keyw> <id>DataTypeKind</id> {
  <br><ident></ident>VOID = <quoted>0</quoted>,
  <br><ident></ident>PRIMITIVE = <quoted>1</quoted>,
  <br><ident></ident>STRING = <quoted>2</quoted>,
  <br><ident></ident>ARRAY = <quoted>3</quoted>,
  <br><ident></ident>FUNCTION = <quoted>4</quoted>,
  <br><ident></ident>ENUM = <quoted>5</quoted>,
  <br><ident></ident>VARIANT = <quoted>6</quoted>,
  <br><ident></ident>VARIANT_TYPE = <quoted>7</quoted>,
  <br><ident></ident>INTERFACE = <quoted>8</quoted>,
  <br><ident></ident>CLASS = <quoted>9</quoted>,
  <br><ident></ident>STRUCT = <quoted>10</quoted>,
  <br><ident></ident>NULLABLE = <quoted>11</quoted>,
  <br>}
</code>

<h4 tocignore>The <code>DataType</code> interface</h4>

<code class="qs">
  <keyw>interface</keyw> <id>DataType</id> {
  <br><ident></ident><keyw>DataTypeKind</keyw> <id>getKind</id>()
  <br>
  <br><ident></ident><keyw>bool</keyw> <id>isDefaultInitializeable</id>()
  <br>
  <br><ident></ident><keyw>string</keyw> <id>getNamespace</id>()
  <br><ident></ident><keyw>string</keyw> <id>getSimpleName</id>()
  <br><ident></ident><keyw>string</keyw> <id>getName</id>()
  <br>
  <br><ident></ident><keyw>uint32</keyw>? <id>getPropertyCount</id>()
  <br><ident></ident><keyw>string</keyw>? <id>getPropertyName</id>(<keyw>uint32</keyw> index)
  <br><ident></ident><keyw>DataType</keyw>? <id>getPropertyType</id>(<keyw>uint32</keyw> index)
  <br>
  <br><ident></ident><keyw>uint32</keyw>? <id>getArgumentCount</id>()
  <br>}
</code>

<h4 tocignore>The <code>getTetralDataType</code> function</h4>

<code class="qs">
  <br><ident></ident><keyw>DataType</keyw> <id>getTetralDataType</id>&lt;<quoted>T</quoted>&gt;()
</code>

## The `std::json` Module
