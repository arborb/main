# Security Branch


# 파일 변경내역

## 공통
* common.js
* main.js

## 사용자 비밀번호 변경
* CS01030P.html
* CS01030P.js

## 사용자관리
* CS01010E.html
* CS01010E.js
* CS01010EController.java
* CS01010EService.java
* CS01010EDAO.java
* CS01010EDAOImpl.java
* cs01010e_sqlmap.xml

## 사용자로그조회
* CS04050Q.html
* CS04050Q.js
* CS04050QController.java
* CS04050QService.java
* cs04050q_sqlmap.xml

## 세션/비밀번호변경시간설정
* CS01080E.html
* CS01080E.js
* CS01080EController.java
* CS01080EService.java
* CS01080EDAO.java
* CS01080EDAOImpl.java
* cs01080e_sqlmap.xml


---
# DB 변경내역
## CSUSERINFO table생성
```javascript
CREATE TABLE CSUSERINFO
(
   USER_SEQ       NUMBER,
   USER_ID        VARCHAR2 (50),
   CLIENT_IP      VARCHAR2 (20),
   PROCESS_FLAG   VARCHAR2 (20),
   REG_USER_ID    VARCHAR2 (50),
   REG_DATETIME   DATE,
   CLIENT_NAME    VARCHAR2 (50)
)
```

## CSUSER table에 ENABLE 컬럼 생성
```javascript
ENABLE             CHAR (1) DEFAULT 'Y',
```
## CSUSER table에 DEFAULT_PW 컬럼 생성
```javascript
DEFAULT_PW         VARCHAR2 (1) DEFAULT 'Y'
```

## CSUSERPASSINFO table에 수정
```javascript
CREATE TABLE CSUSERPASSINFO
(
   JOB_SEQ        NUMBER,
   USER_ID        VARCHAR2 (50),
   USER_PASS      VARCHAR2 (200),
   CLIENT_IP      VARCHAR2 (50),
   REG_USER_ID    VARCHAR2 (50),
   REG_DATETIME   DATE,
   CLIENT_NAME    VARCHAR2 (50)
)
```

## CSSYSTEMINFO table 생성
```javascript
CREATE TABLE CSSYSTEMINFO
(
   PASS_DIV                 VARCHAR2 (50),
   PASS_ITEM_REFERENCE      VARCHAR2 (20),
   SESSION_ITEM_REFERENCE   VARCHAR2 (20),
   REG_USER_ID              VARCHAR2 (50),
   REG_DATETIME             DATE,
   KEY                      VARCHAR2 (50)
)
```

## CSUSERPROGRAMBOOKMARK table 생성
```javascript
CREATE TABLE CSUSERPROGRAMBOOKMARK
(
   USER_ID        VARCHAR2 (50),
   PROGRAM_ID     VARCHAR2 (30),
   EXE_LEVEL1     VARCHAR2 (1),
   EXE_LEVEL2     VARCHAR2 (1),
   EXE_LEVEL3     VARCHAR2 (1),
   EXE_LEVEL4     VARCHAR2 (1),
   FAVORITE_YN    VARCHAR2 (1) DEFAULT 'N',
   REG_USER_ID    VARCHAR2 (50),
   REG_DATETIME   DATE
)
```







