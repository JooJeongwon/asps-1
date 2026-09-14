// Editable screenplay. Every pair of answers rejoins the next question.
window.TEAM04_SCENARIO = {
  "title": "두근두근 코코네: 운명의 팀원을 선택하세요",
  "tagline": "네 명을 모두 만나고, 마지막에 단 한 명을 선택하라.",
  "twist": "단, 선택한 뒤에도 팀플에서는 탈출할 수 없다.",
  "targetSeconds": 160,
  "prologue": [
    "system 네 명을 모두 만나고, 마지막에 한 명을 선택하세요.",
    "you 팀원 소개라며? 왜 미연시가 된 건데?"
  ],
  "routes": [
    {
      "id": "jinhwan",
      "letter": "A",
      "alias": "붉은 궁전의 완전무결한 왕",
      "shortAlias": "완전무결한 왕",
      "scene": 1,
      "location": "코코네 강의실 · 임시 알현실",
      "intro": [
        "jinhwan 왕의 알현실에 온 걸 환영한다.",
        "you 그냥 강의실 의자잖아."
      ],
      "questions": [
        {
          "title": "왕의 첫인상",
          "lines": [
            "jinhwan 내가 앉으면 왕좌다. 첫인상은?"
          ],
          "choices": [
            {
              "text": "잘생겼네.",
              "reply": [
                "jinhwan 정답이다. 보는 눈이 있군."
              ]
            },
            {
              "text": "왕자님 같네.",
              "reply": [
                "jinhwan 왕자라니. 나는 이미 왕이다."
              ]
            }
          ]
        },
        {
          "title": "왕의 책임감",
          "lines": [
            "jinhwan 백엔드도, 팀원들의 등 뒤도 내가 책임진다."
          ],
          "choices": [
            {
              "text": "믿음직한데?",
              "reply": [
                "jinhwan 편히 감탄해라. 나머지는 내가 한다."
              ]
            },
            {
              "text": "약점은 없어?",
              "reply": [
                "jinhwan 아직 발견되지 않았다."
              ]
            }
          ]
        }
      ],
      "departure": [
        "jinhwan 다른 사람도 만나봐라. 비교하면 내가 빛나니까."
      ],
      "bridge": [
        "jinhwan 비교는 끝났군. 이제 골라라."
      ],
      "ending": {
        "title": "결국 정답은 박진환",
        "lines": [
          "jinhwan 정답에 도착했군. 내 옆, 왕비의 자리로 와라.",
          "you 팀플에 왕비까지 필요해?"
        ]
      }
    },
    {
      "id": "jeongwon",
      "letter": "B",
      "alias": "차가운 헤드셋 속 따뜻한 츤데레",
      "shortAlias": "차가운 츤데레",
      "scene": 2,
      "location": "교내 카페 · 창가 자리",
      "intro": [
        "jeongwon 지금 듣는 곡 끝나면 말 걸어도 돼.",
        "you 그렇게 집중해서 뭘 듣고 있어?"
      ],
      "questions": [
        {
          "title": "첫 곡",
          "lines": [
            "jeongwon 그냥 공강이라 듣는 거야.",
            "jeongwon 시끄러운 데서 듣기 좋은 곡은 따로 있거든."
          ],
          "choices": [
            {
              "text": "어떤 노래인지 들려줘.",
              "reply": [
                "jeongwon 여기. 취향 아니어도 끝까지 들어봐.",
                "jeongwon 듣고 싶다니까 주는 거야. 오해는 하지 말고.",
                "jeongwon 끝나면 네가 좋아하는 곡도 하나 골라봐."
              ]
            },
            {
              "text": "나도 그런 곡 추천해줘.",
              "reply": [
                "jeongwon 취향도 모르는데 바로 추천은 못 하지.",
                "jeongwon 일단 네가 듣는 거 하나만 알려줘."
              ]
            }
          ]
        },
        {
          "title": "플레이리스트",
          "lines": [
            "jeongwon 새벽에 듣기 좋은 거, 걸으면서 듣기 좋은 거, 머리 복잡할 때 듣기 좋은 거.",
            "jeongwon 아까 네가 고른 곡, 생각보다 괜찮네.",
            "jeongwon 칭찬은 아니고. 다음 곡 고르기 편하다는 뜻이야."
          ],
          "choices": [
            {
              "text": "나한테도 추천해줘.",
              "reply": [
                "jeongwon 그럼 비슷한 거 세 곡만 보내줄게.",
                "jeongwon 마음에 드는 게 있으면 다음에도 골라봐."
              ]
            },
            {
              "text": "나랑 같이 들어도 돼?",
              "reply": [
                "jeongwon 그래. 그 곡부터 틀어봐.",
                "jeongwon 가까이 앉아. 선이 짧아서 그런 거니까."
              ]
            }
          ]
        }
      ],
      "departure": [
        "jeongwon 다른 사람 만나고 와. 다음 곡은 남겨둘게."
      ],
      "bridge": [
        "jeongwon 다 만났네. 이제 네가 원하는 사람을 골라."
      ],
      "ending": {
        "title": "같이 들을 곡을 고르는 츤데레",
        "lines": [
          "jeongwon 진짜 날 골랐네. 생각보다 괜찮은 선택이네.",
          "you 그건 칭찬이야?",
          "jeongwon 아니. 다음 곡 같이 들을 사람이 생겨서 편하다는 뜻이야."
        ]
      }
    },
    {
      "id": "chihoon",
      "letter": "C",
      "alias": "프랑스 성에서 온 다정한 얼굴마담",
      "shortAlias": "다정한 프랑스 귀족",
      "scene": 2,
      "location": "학교 풀밭 옆 테라스",
      "intro": [
        "chihoon 네가 오니 이 학교도 프랑스 성 같아!",
        "you 여기 코코네인데?"
      ],
      "questions": [
        {
          "title": "프랑스식 환영",
          "lines": [
            "chihoon 널 위해 부야베스를 준비했어."
          ],
          "choices": [
            {
              "text": "떡볶이는 없어?",
              "reply": [
                "chihoon 네가 원하면 프랑스 연회장에도 떡볶이를!"
              ]
            },
            {
              "text": "그게 뭔데?",
              "reply": [
                "chihoon 해산물 수프야. 사랑을 푹 끓였지."
              ]
            }
          ]
        },
        {
          "title": "다정한 응원",
          "lines": [
            "chihoon 팀 분위기도, 네 표정도 놓치지 않을게."
          ],
          "choices": [
            {
              "text": "힘들 때 응원해줘.",
              "reply": [
                "chihoon 아자아자 파이팅! 넌 나의 작은 별!"
              ]
            },
            {
              "text": "응원이 좀 과한데?",
              "reply": [
                "chihoon 아직 시작도 안 했어. 아자아자 파이팅!"
              ]
            }
          ]
        }
      ],
      "departure": [
        "chihoon 보내줄게… 마음만은 여기 두고 가!"
      ],
      "bridge": [
        "chihoon 네 마음의 주인공을 골라줘!"
      ],
      "ending": {
        "title": "프랑스 성의 얼굴마담",
        "lines": [
          "chihoon 돌아왔구나, 나의 작은 부야베스!",
          "you 애칭이 왜 해산물 수프야?"
        ]
      }
    },
    {
      "id": "seongsu",
      "letter": "D",
      "alias": "사주를 엑셀로 증명하는 운명 연구자",
      "shortAlias": "데이터형 운명론자",
      "scene": 3,
      "location": "코코네 옆 수상한 연구실",
      "intro": [
        "seongsu 네가 날 누를 줄 알았어. 운명이니까.",
        "you 그냥 클릭한 건데?"
      ],
      "questions": [
        {
          "title": "운명의 클릭",
          "lines": [
            "seongsu 사람들은 운명을 꼭 ‘그냥’이라고 하더라."
          ],
          "choices": [
            {
              "text": "왠지 끌렸어.",
              "reply": [
                "seongsu 직감 일치. 엑셀에 기록할게."
              ]
            },
            {
              "text": "수상해서 눌렀어.",
              "reply": [
                "seongsu 내 특별함을 알아봤다는 뜻이네."
              ]
            }
          ]
        },
        {
          "title": "실제 사주 노트",
          "lines": [
            "seongsu 이건 우리 네 팀원의 실제 사주 궁합이야."
          ],
          "choices": [
            {
              "text": "내 궁합도 있어?",
              "reply": [
                "seongsu 네 사주는 없으니까, 마음으로 골라줘."
              ]
            },
            {
              "text": "이런 걸 믿어?",
              "reply": [
                "seongsu 원래는. 그래도 마지막 선택은 네가 해."
              ]
            }
          ]
        }
      ],
      "sajuLines": [],
      "departure": [
        "seongsu 다른 사람도 만나봐. 비교 데이터는 필요하니까."
      ],
      "bridge": [
        "seongsu 데이터는 모였어. 이제 네 마음을 알려줘."
      ],
      "ending": {
        "title": "사랑도 검증하는 운명론자",
        "lines": [
          "seongsu 네가 날 골랐다면 증명은 필요 없어.",
          "n 성수가 다시 엑셀을 켠다.",
          "seongsu 그래도 상관계수만 확인하자."
        ]
      }
    }
  ],
  "bridge": [
    "system 네 사람과의 만남 완료. 마지막 한 명을 선택하세요."
  ],
  "commonEnding": [
    "jeongwon 한 명을 골라도 팀플은 네 명이 같이해.",
    "chihoon 평생 응원할게! 아자아자 파이팅!",
    "system 아무개님, TEAM 01 가입 완료. 탈퇴 기능은 없습니다.",
    "you 한 명 고르랬더니 네 명과 평생 팀플이잖아!"
  ]
};
